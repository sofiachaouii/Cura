// src/pages/UploadDocument.tsx
import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Upload, X, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { documents } from '../services/api'

export default function UploadDocument() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: documents.upload,
    onSuccess: () => {
      navigate(
        user?.role === 'student'
          ? '/student/dashboard'
          : '/teacher/dashboard'
      )
    },
    onError: () => {
      setError('Failed to upload document. Please try again.')
    },
  })

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const dropped = e.dataTransfer.files?.[0]
    if (!dropped) return

    if (dropped.type === 'application/pdf') {
      setFile(dropped)
      setError(null)
    } else {
      setError('Please upload a PDF file')
    }
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (!selected) return

      if (selected.type === 'application/pdf') {
        setFile(selected)
        setError(null)
      } else {
        setError('Please upload a PDF file')
      }
    },
    []
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }
    uploadMutation.mutate(file)
  }

  const isUploading = uploadMutation.status === 'pending'

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Upload Document
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* transparent file-input covers the entire dropzone */}
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* your UI sits underneath */}
          <div className="flex flex-col items-center pointer-events-none">
            <Upload
              className={`h-12 w-12 ${
                dragActive ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
            <p className="mt-2 text-sm text-gray-500">
              Drag & drop your PDF here, or click to browse
            </p>
          </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected file: {file.name}
                  </p>
                )}
              </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || isUploading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
