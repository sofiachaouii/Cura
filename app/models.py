from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    role: str  # "teacher" or "student"
    
class UserCreate(UserBase):
    password: str
    name: str  

class User(UserBase):
    id: str
    name: str  
    created_at: datetime
    
    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    file_name: str
    extracted_text: str

class SubmissionCreate(SubmissionBase):
    user_id: str

class Submission(SubmissionBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    feedback_text: str
    tone: str
    grade: Optional[float] = None

class FeedbackCreate(FeedbackBase):
    submission_id: str

class Feedback(FeedbackBase):
    id: str
    submission_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ValuesStatement(BaseModel):
    id: str
    text: str
    
    class Config:
        from_attributes = True

class ValuesResponse(BaseModel):
    id: str
    user_id: str
    statement_id: str
    stance: str
    response: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ValuesResponseCreate(BaseModel):
    statement_id: str
    stance: str
    response: str

class ValuesReflection(BaseModel):
    reflection: str 
