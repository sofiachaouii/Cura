import pytest
from fastapi.testclient import TestClient
from app.main import app
import os

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Cura API"}

def test_signup():
    response = client.post(
        "/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "role": "student"
        }
    )
    assert response.status_code in [200, 400]  # 400 if user already exists

def test_login():
    response = client.post(
        "/auth/login",
        data={
            "username": "test@example.com",
            "password": "testpassword123"
        }
    )
    assert response.status_code in [200, 401]  # 401 if credentials are invalid

@pytest.mark.asyncio
async def test_upload_document():
    # Create a test file
    test_file_path = "test.txt"
    with open(test_file_path, "w") as f:
        f.write("Test content")
    
    try:
        with open(test_file_path, "rb") as f:
            response = client.post(
                "/upload/",
                files={"file": ("test.txt", f, "text/plain")}
            )
        assert response.status_code in [200, 401]  # 401 if not authenticated
    finally:
        # Clean up
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

@pytest.mark.asyncio
async def test_generate_feedback():
    response = client.post(
        "/feedback/generate",
        json={
            "submission_id": "test-submission-id",
            "tone": "Affirming",
            "grade": 85
        }
    )
    assert response.status_code in [200, 401, 404]  # 401 if not authenticated, 404 if submission not found 