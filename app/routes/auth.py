# app/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from supabase import create_client, Client
from typing import Optional
from datetime import datetime
import logging

from app.models import UserCreate, User
from app.core.config import settings
from app.utils.jwt_handler import jwt_handler

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
logger = logging.getLogger(__name__)


@router.post("/signup", response_model=User)
async def signup(user: UserCreate):
    """
    Create a new user in Supabase Auth, storing `role` and `name` in user_metadata.
    """
    try:
        logger.info(f"Signing up via Supabase at {settings.SUPABASE_URL}")
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "role": user.role,
                    "name": user.name
                }
            }
        })

        if auth_response.user:
            return User(
                id=auth_response.user.id,
                email=user.email,
                role=user.role,
                name=user.name,
                created_at=auth_response.user.created_at
            )

        raise HTTPException(status_code=400, detail="Failed to create user")
    except Exception as e:
        logger.error("Signup error", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate against Supabase Auth and return a JWT access token.
    """
    try:
        logger.info(f"Logging in via Supabase at {settings.SUPABASE_URL}")
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })

        if auth_response.user:
            return {
                "access_token": auth_response.session.access_token,
                "token_type": "bearer",
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "role": auth_response.user.user_metadata.get("role"),
                    "name": auth_response.user.user_metadata.get("name")
                }
            }

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    except Exception as e:
        logger.error("Login error", exc_info=True)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.get("/me", response_model=User)
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Verify the JWT, extract user_metadata, and return the current User.
    """
    try:
        payload = jwt_handler.verify_token(token)

        user_meta = payload.get("user_metadata")
        if not user_meta:
            raise HTTPException(status_code=401, detail="User metadata missing")

        iat = payload.get("iat")
        if iat is None:
            raise HTTPException(status_code=401, detail="Token missing iat claim")
        created_at = datetime.fromtimestamp(iat)

        return User(
            id=user_meta["sub"],
            email=user_meta["email"],
            role=user_meta.get("role", "student"),
            name=user_meta.get("name", ""),
            created_at=created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Token verification error in get_current_user", exc_info=True)
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
