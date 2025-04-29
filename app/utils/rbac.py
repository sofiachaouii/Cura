from functools import wraps
from fastapi import HTTPException, Depends
from typing import List, Optional, Callable
from app.routes.auth import get_current_user
from app.models import User
import logging 

logger = logging.getLogger(__name__)

def require_roles(allowed_roles: List[str]):
    """
    Decorator to restrict access to routes based on user roles.
    
    Args:
        allowed_roles: List of roles that are allowed to access the route
        
    Returns:
        Decorated function with role-based access control
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if current_user.role not in allowed_roles:
                logger.warning(f"Access denied: User {current_user.email} with role {current_user.role} attempted to access a route restricted to {allowed_roles}")
                raise HTTPException(
                    status_code=403,
                    detail=f"Access denied. This endpoint requires one of the following roles: {', '.join(allowed_roles)}"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Convenience functions for common role checks
def require_teacher(func: Callable):
    """Decorator to restrict access to teachers only."""
    return require_roles(["teacher"])(func)

def require_student(func: Callable):
    """Decorator to restrict access to students only."""
    return require_roles(["student"])(func)

def require_teacher_or_student(func: Callable):
    """Decorator to allow access to both teachers and students."""
    return require_roles(["teacher", "student"])(func) 
