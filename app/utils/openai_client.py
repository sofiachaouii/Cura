# app/utils/openai_client.py
from openai import OpenAI
from app.core.config import settings
from starlette.concurrency import run_in_threadpool
from typing import Optional

client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_feedback(
    extracted_text: str,
    tone: str,
    teacher_notes: str,
    conciseness: str,
    grade: Optional[float] = None,
) -> str:
    """
    Build and send a prompt to OpenAI that incorporates
    the student text, teacher notes, tone, length preference,
    and optional grade.
    """
    model_name = getattr(settings, "OPENAI_MODEL", "gpt-3.5-turbo")

    system_prompt = (
        "You are a warm, encouraging tutor. First celebrate strengths, "
        "then gently point out 1–2 areas to improve. Keep it conversational."
    )
    user_prompt = (
        f"Student text:\n{extracted_text}\n\n"
        f"Teacher notes to incorporate:\n{teacher_notes}\n\n"
        f"Tone: {tone}\n"
        f"Length: {conciseness}\n"
        f"Grade: {grade if grade is not None else 'N/A'}"
    )

    # run blocking OpenAI call in threadpool
    response = await run_in_threadpool(
        lambda: client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
        )
    )
    return response.choices[0].message.content


async def generate_follow_up_response(
    extracted_text: str,
    feedback_text: str,
    question: str,
) -> str:
    """
    Handle student follow-up questions by feeding the original
    text and the latest feedback into the AI plus the new question.
    """
    model_name = getattr(settings, "OPENAI_MODEL", "gpt-3.5-turbo")

    system_prompt = (
        "You are a helpful tutor answering follow-up questions. "
        "Be concise, clear, and encouraging."
    )
    messages = [
        {"role": "system",    "content": system_prompt},
        {"role": "assistant", "content": feedback_text},
        {"role": "user",      "content": question},
    ]

    response = await run_in_threadpool(
        lambda: client.chat.completions.create(
            model=model_name,
            messages=messages,
        )
    )
    return response.choices[0].message.content

async def generate_reflection(
    statement_text: str,
    stance: str,
    response_text: str,
) -> str:
    """
    Generate a reflection on a student's response to a values statement.
    """
    model_name = getattr(settings, "OPENAI_MODEL", "gpt-3.5-turbo")

    system_prompt = (
        "You are a thoughtful mentor helping students reflect on their values and beliefs. "
        "Your role is to help them explore their reasoning and consider alternative perspectives "
        "while maintaining a supportive and non-judgmental tone."
    )
    
    user_prompt = (
        f"Statement: {statement_text}\n\n"
        f"Student's stance: {stance}\n\n"
        f"Student's response: {response_text}\n\n"
        "Please provide a brief reflection that:\n"
        "1. Acknowledges their perspective\n"
        "2. Highlights any strong reasoning they've shown\n"
        "3. Gently prompts them to consider an alternative viewpoint\n"
        "4. Encourages further reflection"
    )

    response = await run_in_threadpool(
        lambda: client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
    )
    return response.choices[0].message.content
