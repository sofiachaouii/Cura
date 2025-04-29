# app/utils/jwt_handler.py

import jwt
from typing import Dict, Any
from fastapi import HTTPException
from app.core.config import settings
import logging 

logger = logging.getLogger(__name__)

class JWTHandler:
    def __init__(self):
        # Issuer must match your Supabase "Project URL/auth/v1"
        self.issuer = f"{settings.SUPABASE_URL}/auth/v1"
        # Audience must match the Supabase token's "aud" claim
        self.audience = "authenticated"

    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode the JWT token using HS256, but ignore expiration."""
        try:
            logger.info(f"JWT secret being used: {settings.SUPABASE_JWT_SECRET[:8]}...")
            logger.info(f"JWT issuer: {self.issuer}")
            logger.info(f"JWT audience: {self.audience}")

            # Decode and verify the token, but turn off expiry verification
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience=self.audience,
                issuer=self.issuer,
                options={"verify_exp": False},
            )

            # We no longer enforce expiry, so skip _check_token_expiry entirely
            return payload

        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")

        except Exception as e:
            logger.error(f"Token verification error: {e}", exc_info=True)
            raise HTTPException(status_code=401, detail="Token verification failed")


# Singleton instance
jwt_handler = JWTHandler()
