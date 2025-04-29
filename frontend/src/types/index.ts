// src/types/index.ts 
import { FormEvent } from 'react'

export type FormSubmitEvent = FormEvent<HTMLFormElement>

export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher'
}

export interface Submission {
  id: string
  documentName: string
  studentName: string
  submittedAt: string
}

export interface Document extends Submission {
  status: 'pending' | 'reviewed'
  studentId: string
  teacherId?: string
  content?: string
  feedback?: string
}

export interface Feedback {
  id: string
  submission_id: string
  feedback_text: string
  tone: 'Affirming' | 'Gentle Redirection' | 'Clarity-Focused'
  grade?: number
  created_at: string
}

export interface ValueStatement {
  id: string
  statement: string
}

export interface ValueResponse {
  statementId: string
  stance: 'for' | 'against'
  response: string
}

export interface ValueReflection {
  reflection: string
}

export interface ApiError {
  message: string
  status: number
}
