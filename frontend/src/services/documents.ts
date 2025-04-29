// src/services/documents.ts
import { api } from './api'          // ← pull in your axios instance
import type { AxiosResponse } from 'axios'

export async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  // POST to your FastAPI /upload endpoint
  const response: AxiosResponse = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}
 
