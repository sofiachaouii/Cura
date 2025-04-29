# app/routes/feedback.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging 

from app.models import Feedback as FeedbackModel, FeedbackCreate
from app.routes.auth import get_current_user
from app.utils.openai_client import generate_feedback, generate_follow_up_response
from app.utils.rbac import require_teacher, require_teacher_or_student, require_student
from supabase import create_client, Client
from app.core.config import settings

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
logger = logging.getLogger(__name__)


class GenerateFeedbackRequest(BaseModel):
    submission_id: str
    tone: str = "Affirming"
    grade: Optional[float] = None
    teacher_notes: str
    conciseness: str


class FollowUpQuestionRequest(BaseModel):
    submission_id: str
    question: str


@router.post(
    "/generate",
    response_model=FeedbackModel,
)
@require_teacher
async def generate_feedback_endpoint(
    payload: GenerateFeedbackRequest,
    current_user=Depends(get_current_user),
):
    """
    Generate feedback for a submission. Only teachers can access this endpoint.
    """
    try:
        # Fetch the submission text
        submission_resp = (
            supabase.table("submissions")
            .select("*")
            .eq("id", payload.submission_id)
            .execute()
        )
        if not submission_resp.data:
            raise HTTPException(status_code=404, detail="Submission not found")

        text = submission_resp.data[0]["extracted_text"]

        # Call OpenAI
        feedback_text = await generate_feedback(
            text,
            payload.tone,
            payload.teacher_notes,
            payload.conciseness,
            payload.grade,
        )

        # Insert into feedback table
        insert_resp = (
            supabase.table("feedback")
            .insert({
                "submission_id": payload.submission_id,
                "feedback_text": feedback_text,
                "tone": payload.tone,
                "grade": payload.grade,
            })
            .execute()
        )

        if insert_resp.data:
            row = insert_resp.data[0]
            return FeedbackModel(
                id=row["id"],
                submission_id=row["submission_id"],
                feedback_text=row["feedback_text"],
                tone=row["tone"],
                grade=row["grade"],
                created_at=row["created_at"],
            )

        raise HTTPException(status_code=500, detail="Failed to create feedback")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/submission/{submission_id}",
    response_model=List[FeedbackModel],
)
async def get_feedback_for_submission(
    submission_id: str,
    current_user=Depends(get_current_user),
):
    """
    Get all feedback for a specific submission.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        resp = (
            supabase.table("feedback")
            # include submission_id so the FeedbackModel serializer won't complain
            .select("submission_id, id, feedback_text, tone, grade, created_at")
            .eq("submission_id", submission_id)
            .order("created_at", desc=False)
            .execute()
        )
        return resp.data or []
    except Exception as e:
        logger.error(f"Error retrieving feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/my-feedback",
    response_model=List[FeedbackModel],
)
@require_student
async def get_my_feedback(current_user=Depends(get_current_user)):
    """
    Get all feedback for the current student's submissions.
    Only students can access this endpoint.
    """
    try:
        subs_resp = (
            supabase.table("submissions")
            .select("id")
            .eq("user_id", current_user.id)
            .execute()
        )
        ids = [s["id"] for s in (subs_resp.data or [])]
        if not ids:
            return []

        fb_resp = (
            supabase.table("feedback")
            .select("submission_id, id, feedback_text, tone, grade, created_at")
            .in_("submission_id", ids)
            .order("created_at", desc=False)
            .execute()
        )

        return [
            FeedbackModel(
                id=f["id"],
                submission_id=f["submission_id"],
                feedback_text=f["feedback_text"],
                tone=f["tone"],
                grade=f.get("grade"),
                created_at=f["created_at"],
            )
            for f in (fb_resp.data or [])
        ]
    except Exception as e:
        logger.error(f"Error retrieving user feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/follow-up",
    response_model=dict,
)
@require_teacher_or_student
async def ask_follow_up_question(
    payload: FollowUpQuestionRequest,
    current_user=Depends(get_current_user),
):
    """
    Allow students to ask follow-up questions about feedback.
    """
    try:
        # Fetch submission
        sub_resp = (
            supabase.table("submissions")
            .select("*")
            .eq("id", payload.submission_id)
            .execute()
        )
        if not sub_resp.data:
            raise HTTPException(status_code=404, detail="Submission not found")

        submission = sub_resp.data[0]
        if (
            current_user.role == "student"
            and submission["user_id"] != current_user.id
        ):
            raise HTTPException(status_code=403, detail="Forbidden")

        # Get latest feedback
        fb_resp = (
            supabase.table("feedback")
            .select("submission_id, id, feedback_text, tone, grade, created_at")
            .eq("submission_id", payload.submission_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not fb_resp.data:
            raise HTTPException(status_code=404, detail="No feedback found")

        fb = fb_resp.data[0]

        # Call OpenAI follow-up
        response_text = await generate_follow_up_response(
            submission["extracted_text"], fb["feedback_text"], payload.question
        )

        # (Optional) store question/response here in DB...

        return {"response": response_text}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing follow-up: {e}")
        raise HTTPException(status_code=500, detail=str(e))
