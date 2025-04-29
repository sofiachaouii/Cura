import os
import logging
from typing import List
from datetime import datetime 

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from supabase import create_client, Client

from app.models import Submission, User
from app.core.config import settings
from app.routes.auth import get_current_user
from app.utils.file_processor import extract_text_from_file
from app.utils.rbac import require_teacher, require_teacher_or_student

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
logger = logging.getLogger(__name__)

# Debug log
logger.info(f"Upload router initialized with Supabase URL: {settings.SUPABASE_URL}")

# Ensure upload dir exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=Submission)
@require_teacher_or_student
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type")

    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    try:
        # save & extract
        content = await file.read()
        with open(file_path, "wb") as buf:
            buf.write(content)

        extracted_text = extract_text_from_file(file_path, file.content_type)

        # insert into Supabase
        response = supabase.table("submissions").insert({
            "user_id": current_user.id,
            "file_name": file.filename,
            "extracted_text": extracted_text,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        if response.data:
            row = response.data[0]
            return Submission(
                id=row["id"],
                user_id=current_user.id,
                file_name=file.filename,
                extracted_text=extracted_text,
                created_at=row["created_at"],
            )

        raise HTTPException(500, "Failed to create submission")

    except Exception as e:
        # cleanup on error
        if os.path.exists(file_path):
            os.remove(file_path)
        logger.error("Error uploading document", exc_info=e)
        raise HTTPException(500, str(e))


@router.get("/my-submissions")
async def get_my_submissions(current_user=Depends(get_current_user)):
    """
    Get all submissions for the current user.
    """
    if not current_user:
        raise HTTPException(401, "Not authenticated")

    try:
        resp = supabase.table("submissions").select(
            "id, file_name, created_at"
        ).eq("user_id", current_user.id).order("created_at", desc=True).execute()

        return [
            {
                "id": s["id"],
                "documentName": s["file_name"],
                "submittedAt": s["created_at"],
            }
            for s in resp.data
        ]
    except Exception as e:
        logger.error("Error retrieving user submissions", exc_info=e)
        raise HTTPException(500, str(e))


@router.get("/all-submissions", response_model=List[Submission])
@require_teacher
async def get_all_submissions(current_user: User = Depends(get_current_user)):
    """
    Teacher-only: return every submission in the system.
    """
    try:
        resp = supabase.table("submissions").select("*").execute()
        data = resp.data or []
        return [
            Submission(
                id=item["id"],
                user_id=item["user_id"],
                file_name=item["file_name"],
                extracted_text=item["extracted_text"],
                created_at=item["created_at"],
            )
            for item in data
        ]
    except Exception as e:
        logger.error("Error retrieving all submissions", exc_info=e)
        raise HTTPException(500, str(e))
