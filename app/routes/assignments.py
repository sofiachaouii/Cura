from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from datetime import datetime
import logging 

from app.routes.auth import get_current_user
from app.utils.rbac import require_teacher
from supabase import create_client, Client
from app.core.config import settings

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
logger = logging.getLogger(__name__)

class Assignment(BaseModel):
    id: str
    student_id: str
    teacher_id: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/ping")
async def ping():
    return {"ok": True}

@router.post("/assign/{student_id}", response_model=Assignment)
@require_teacher
async def assign_student_to_teacher(
    student_id: str,
    current_user=Depends(get_current_user)
):
    """Assign a student to the current teacher."""
    try:
        # First verify that the student exists and is actually a student
        student_resp = supabase.from_("auth.users").select("*").eq("id", student_id).execute()
        if not student_resp.data:
            raise HTTPException(404, "Student not found")
        
        student = student_resp.data[0]
        if student.get("raw_user_meta_data", {}).get("role") != "student":
            raise HTTPException(400, "User is not a student")

        # Check if assignment already exists
        existing_resp = supabase.table("student_teacher_assignments") \
            .select("*") \
            .eq("student_id", student_id) \
            .eq("teacher_id", current_user.id) \
            .execute()
        
        if existing_resp.data:
            raise HTTPException(400, "Student is already assigned to you")

        # Create the assignment
        assignment_data = {
            "student_id": student_id,
            "teacher_id": current_user.id
        }
        resp = supabase.table("student_teacher_assignments").insert(assignment_data).execute()
        
        if resp.data:
            return Assignment(**resp.data[0])
        raise HTTPException(500, "Failed to create assignment")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning student: {str(e)}", exc_info=True)
        raise HTTPException(500, f"Error assigning student: {str(e)}")

@router.get("/my-students", response_model=List[Assignment])
@require_teacher
async def get_my_students(current_user=Depends(get_current_user)):
    """Get all students assigned to the current teacher."""
    try:
        resp = supabase.table("student_teacher_assignments") \
            .select("*") \
            .eq("teacher_id", current_user.id) \
            .execute()
        
        return [Assignment(**assignment) for assignment in (resp.data or [])]
    except Exception as e:
        logger.error(f"Error getting students: {str(e)}", exc_info=True)
        raise HTTPException(500, str(e))

@router.delete("/unassign/{student_id}")
@require_teacher
async def unassign_student(
    student_id: str,
    current_user=Depends(get_current_user)
):
    """Remove a student assignment from the current teacher."""
    try:
        resp = supabase.table("student_teacher_assignments") \
            .delete() \
            .eq("teacher_id", current_user.id) \
            .eq("student_id", student_id) \
            .execute()
        
        if not resp.data:
            raise HTTPException(404, "Assignment not found")
        return {"message": "Assignment removed successfully"}
    except Exception as e:
        logger.error(f"Error unassigning student: {str(e)}", exc_info=True)
        raise HTTPException(500, str(e)) 
