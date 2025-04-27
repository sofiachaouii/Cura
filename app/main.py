from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, upload, feedback, teacher, assignments, values
from app.core.config import settings
from app.routes.values import router as values_router

app = FastAPI(
    title="Cura API",
    description="A feedback platform API for teachers and students",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/upload", tags=["Document Upload"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback Generation"])
app.include_router(teacher.router, prefix="/teacher", tags=["Teacher Operations"])
app.include_router(assignments.router, prefix="/assignments", tags=["Student-Teacher Assignments"])
app.include_router(values_router, prefix="/values", tags=["Weekly Statement"])

@app.get("/")
async def root():
    return {"message": "Welcome to Cura API"} 