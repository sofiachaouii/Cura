from fastapi import APIRouter, HTTPException, Depends
from app.routes.auth import get_current_user
from app.utils.rbac import require_teacher
from supabase import create_client, Client
from app.core.config import settings
import logging
 
router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
logger = logging.getLogger(__name__)

@router.get("/submissions")
@require_teacher
async def get_teacher_submissions(current_user=Depends(get_current_user)):
    """
    Get all submissions with student names for teachers.
    """
    if not current_user:
        raise HTTPException(401, "Not authenticated")

    try:
        resp = supabase.from_("submissions") \
            .select("id, file_name, created_at, users(name)") \
            .order("created_at", desc=True) \
            .execute()

        return [
            {
                "id": s["id"],
                "fileName": s["file_name"],
                "submittedAt": s["created_at"],
                "studentName": s["users"]["name"] if s.get("users") else "Unknown"
            }
            for s in resp.data
        ]
    except Exception as e:
        logger.error("Error retrieving teacher submissions", exc_info=e)
        raise HTTPException(500, str(e)) 
