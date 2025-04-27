from fastapi import APIRouter, HTTPException, Depends
from typing import Literal
from datetime import datetime, timedelta
import logging
from uuid import UUID

from app.models import ValuesStatement, ValuesResponse, ValuesResponseCreate, ValuesReflection
from app.routes.auth import get_current_user
from app.utils.rbac import require_student
from app.utils.openai_client import generate_reflection
from supabase import create_client, Client
from app.core.config import settings

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
logger = logging.getLogger(__name__)

@router.get("/next-statement", response_model=ValuesStatement)
@require_student
async def get_next_statement(current_user=Depends(get_current_user)):
    """
    Get the next values statement for the current student.
    Ensures one statement per student per week.
    """
    try:
        # Get the current week's start (Monday)
        today = datetime.now()
        week_start = today - timedelta(days=today.weekday())
        logger.info(f"Week start: {week_start}")
        
        # Get all statements
        statements_resp = supabase.table("value_statements").select("*").execute()
        logger.info(f"Found {len(statements_resp.data) if statements_resp.data else 0} statements")
        if not statements_resp.data:
            raise HTTPException(404, "No values statements found")
        
        # Get student's responses for this week
        responses_resp = supabase.table("values_responses") \
            .select("statement_id") \
            .eq("user_id", current_user.id) \
            .gte("created_at", week_start.isoformat()) \
            .execute()
        logger.info(f"Found {len(responses_resp.data) if responses_resp.data else 0} responses this week")
        
        # Get IDs of statements the student has already responded to this week
        responded_ids = {r["statement_id"] for r in (responses_resp.data or [])}
        logger.info(f"Responded to statement IDs: {responded_ids}")
        
        # Filter out statements the student has already responded to
        available_statements = [s for s in statements_resp.data if s["id"] not in responded_ids]
        logger.info(f"Available statements: {len(available_statements)}")
        
        if not available_statements:
            raise HTTPException(404, "No new statements available this week")
        
        # Select the first available statement
        # In a production environment, you might want to use a more sophisticated selection algorithm
        selected_statement = available_statements[0]
        logger.info(f"Selected statement: {selected_statement}")
        
        # Check if the column is named 'text' or 'statement'
        statement_text = selected_statement.get("text") or selected_statement.get("statement")
        if not statement_text:
            logger.error(f"Statement text not found in columns: {list(selected_statement.keys())}")
            raise HTTPException(500, "Statement text not found in database")
        
        # Create the response object
        response_obj = ValuesStatement(
            id=selected_statement["id"],
            text=statement_text
        )
        logger.info(f"Returning statement: {response_obj}")
        
        return response_obj
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting next statement: {str(e)}", exc_info=True)
        raise HTTPException(500, str(e))

@router.post("/respond", response_model=ValuesReflection)
@require_student
async def submit_response(
    response: ValuesResponseCreate,
    current_user=Depends(get_current_user)
):
    """
    Submit a response to a values statement and get a reflection.
    """
    try:
        # Verify the statement exists
        statement_resp = supabase.table("value_statements") \
            .select("*") \
            .eq("id", response.statement_id) \
            .execute()
        
        if not statement_resp.data:
            raise HTTPException(404, "Statement not found")
        
        # Get the statement text, handling both column names
        statement = statement_resp.data[0]
        statement_text = statement.get("text") or statement.get("statement")
        if not statement_text:
            logger.error(f"Statement text not found in columns: {list(statement.keys())}")
            raise HTTPException(500, "Statement text not found in database")
        
        # Insert the response
        response_data = {
            "user_id": current_user.id,
            "statement_id": response.statement_id,
            "stance": response.stance,
            "response": response.response
        }
        
        insert_resp = supabase.table("values_responses").insert(response_data).execute()
        
        if not insert_resp.data:
            raise HTTPException(500, "Failed to save response")
        
        # Generate reflection using OpenAI
        reflection_text = await generate_reflection(
            statement_text=statement_text,
            stance=response.stance,
            response_text=response.response
        )
        
        return ValuesReflection(reflection=reflection_text)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting response: {str(e)}", exc_info=True)
        raise HTTPException(500, str(e))

@router.get("/ping")
async def ping():
    """
    Simple endpoint to check if the values router is working.
    Also checks the structure of the values table.
    """
    try:
        # Check if the value_statements table exists and has data
        statements_resp = supabase.table("value_statements").select("*").execute()
        logger.info(f"Value statements table structure: {statements_resp.data[0] if statements_resp.data else 'No data'}")
        
        # Check the column names
        if statements_resp.data and len(statements_resp.data) > 0:
            first_statement = statements_resp.data[0]
            logger.info(f"Column names in value_statements table: {list(first_statement.keys())}")
            
            # Check if 'text' column exists
            if 'text' not in first_statement:
                logger.error("'text' column not found in value_statements table!")
                return {"status": "error", "message": "'text' column not found in value_statements table"}
        
        return {"status": "ok", "message": "Values router is working"}
    except Exception as e:
        logger.error(f"Error in ping endpoint: {str(e)}", exc_info=True)
        return {"status": "error", "message": str(e)} 