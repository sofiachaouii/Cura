# Cura - Feedback Platform Backend

A FastAPI-based backend for a feedback platform that helps teachers provide AI-generated feedback on student submissions.

## Features

- User Authentication (Teachers and Students)
- Document Upload (PDF, DOCX, TXT)
- AI-powered Feedback Generation
- Supabase Integration for Data Storage
- OpenAI GPT-4 Integration
- Weekly Values Statements for Students
- Student-Teacher Assignment Management

## Prerequisites

- Python 3.8+
- Supabase Account
- OpenAI API Key
- Git

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cura
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with the following variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

5. Create the required Supabase tables:

```sql
-- Users table (handled by Supabase Auth)
-- Submissions table
create table submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  file_name text not null,
  extracted_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Feedback table
create table feedback (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references submissions(id),
  feedback_text text not null,
  tone text not null,
  grade float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Student-Teacher Assignments table
create table student_teacher_assignments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references auth.users(id) not null,
  teacher_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, teacher_id)
);

-- Values Statements table
create table value_statements (
  id uuid default uuid_generate_v4() primary key,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Values Responses table
create table values_responses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  statement_id uuid references value_statements(id) not null,
  stance text not null,
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

6. Insert some sample values statements:
```sql
INSERT INTO value_statements (text) VALUES
('Honesty is always the best policy, even when it might be uncomfortable.'),
('Success is more about luck than hard work.'),
('Technology is making us less human.'),
('Education should be free for everyone.'),
('Social media has more negative than positive effects on society.');
```

## Running the Application

1. Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

2. Access the API documentation at `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /auth/signup`: Register a new user
- `POST /auth/login`: Login user
- `GET /auth/me`: Get current user information

### Document Management
- `POST /upload`: Upload a document
- `GET /upload/my-submissions`: Get current user's submissions
- `GET /upload/all-submissions`: Get all submissions (teachers only)

### Feedback
- `POST /feedback/generate`: Generate feedback for a submission
- `GET /feedback/my-feedback`: Get feedback for current user's submissions
- `GET /feedback/submission/{submission_id}`: Get feedback for a specific submission
- `POST /feedback/follow-up`: Ask a follow-up question about feedback

### Values Statements
- `GET /values/next-statement`: Get the next values statement for the current student
- `POST /values/respond`: Submit a response to a values statement

### Student-Teacher Assignments
- `POST /assignments/{student_id}`: Assign a student to the current teacher
- `GET /assignments/my-students`: Get all students assigned to the current teacher
- `DELETE /assignments/unassign/{student_id}`: Remove a student assignment

## Testing

Run the tests using pytest:
```bash
pytest
```

## Project Structure

```
cura/
├── app/
│   ├── core/
│   │   └── config.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── upload.py
│   │   ├── feedback.py
│   │   ├── teacher.py
│   │   ├── assignments.py
│   │   └── values.py
│   ├── utils/
│   │   ├── file_processor.py
│   │   ├── openai_client.py
│   │   ├── jwt_handler.py
│   │   └── rbac.py
│   ├── models.py
│   └── main.py
├── tests/
│   └── test_api.py
├── uploads/
├── requirements.txt
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 