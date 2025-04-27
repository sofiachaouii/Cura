// src/services/api.ts
import axios, { AxiosError } from 'axios'
import type { Feedback, Submission, Document } from '../types'

// Use environment variable for API URL
const baseURL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Attach token on every request ────────────────────────────────────────────
api.interceptors.request.use(
  config => {
    const stored = localStorage.getItem('auth')
    if (stored && config.headers) {
      const { token } = JSON.parse(stored)
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ─── Handle errors ───────────────────────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth API ────────────────────────────────────────────────────────────────
export const auth = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  signup: async (
    email: string,
    password: string,
    role: 'student' | 'teacher',
    name: string
  ) => {
    const { data } = await api.post('/auth/signup', {
      email,
      password,
      role,
      name,
    })
    return data
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  },
}

// ─── Student API ──────────────────────────────────────────────────────────────
export const student = {
  getMySubmissions: async (): Promise<Submission[]> => {
    const { data } = await api.get<Submission[]>('/upload/my-submissions')
    return data
  },

  getMyFeedback: async (): Promise<Feedback[]> => {
    const { data } = await api.get<Feedback[]>('/feedback/my-feedback')
    return data
  },

  getFeedbackForSubmission: async (
    submissionId: string
  ): Promise<Feedback[]> => {
    const { data } = await api.get<Feedback[]>(
      `/feedback/submission/${submissionId}`
    )
    return data
  },

  askFollowUp: async (
    submissionId: string,
    question: string
  ): Promise<{ response: string }> => {
    const { data } = await api.post<{ response: string }>(
      '/feedback/follow-up',
      { submission_id: submissionId, question }
    )
    return data
  },

  // Value Statement API
  getNextValueStatement: async (): Promise<{ id: string; statement: string }> => {
    try {
      const { data } = await api.get<{ id: string; text: string }>('/values/next-statement')
      console.log('API - getNextValueStatement response:', data)
      // Transform the response to match the expected format
      return {
        id: data.id,
        statement: data.text
      }
    } catch (error) {
      console.error('API - getNextValueStatement error:', error)
      throw error
    }
  },

  submitValueResponse: async (
    statementId: string,
    stance: 'for' | 'against',
    response: string
  ): Promise<{ reflection: string }> => {
    const { data } = await api.post<{ reflection: string }>('/values/respond', {
      statementId,
      stance,
      response,
    })
    return data
  },
}

// ─── Teacher API ──────────────────────────────────────────────────────────────
export const teacher = {
  getAllSubmissions: async (): Promise<Document[]> => {
    const { data } = await api.get<Document[]>('/upload/all-submissions')
    return data
  },

  generateFeedback: async (
    submissionId: string,
    notes: string,
    conciseness: string,
    grade?: number
  ): Promise<Feedback> => {
    // Send the teacher's notes to be incorporated into the AI-generated feedback
    const { data } = await api.post<Feedback>('/feedback/generate', {
      submission_id: submissionId,
      teacher_notes: notes, // Renamed to make it clear these are teacher notes
      conciseness,
      grade,
    })
    return data
  },
}

// ─── Documents API ─────────────────────────────────────────────────────────────
export const documents = {
  upload: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/upload/${id}`)
    return data
  },
}
