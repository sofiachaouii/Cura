// src/pages/teacher/GenerateFeedback.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { teacher } from '../../services/api'
import type { Feedback } from '../../types'
import { Info } from 'lucide-react'

export default function GenerateFeedback() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()

  const [notes, setNotes] = useState('')
  const [conciseness, setConciseness] = useState<'concise' | 'detailed'>('detailed')
  const [grade, setGrade] = useState('')

  const mutation = useMutation<Feedback, Error, void>({
    mutationFn: () => {
      // ensure submissionId is defined
      if (!submissionId) {
        return Promise.reject(new Error('No submission ID'))
      }
      return teacher.generateFeedback(
        submissionId,
        notes,
        conciseness,
        grade ? parseInt(grade, 10) : undefined
      )
    },
    onSuccess: (data) => {
      // Show the generated feedback before navigating
      setGeneratedFeedback(data)
    },
  })

  const [generatedFeedback, setGeneratedFeedback] = useState<Feedback | null>(null)

  if (!submissionId) {
    return <div className="p-4 text-red-600">No submission ID provided</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Generate Feedback</h1>
      <form
        onSubmit={e => {
          e.preventDefault()
          mutation.mutate()
        }}
        className="space-y-6"
      >
        {/* Teacher Notes */}
        <div>
          <div className="flex items-center mb-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Teacher Notes
            </label>
            <div className="ml-2 flex items-center text-xs text-blue-600">
              <Info className="h-4 w-4 mr-1" />
              <span>These notes will be incorporated into the AI-generated feedback</span>
            </div>
          </div>
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Provide specific comments about the submission. For example: 'The student's analysis is thorough but lacks concrete examples. The conclusion needs strengthening. Grammar is generally good with a few minor errors.'"
          />
          <p className="mt-1 text-sm text-gray-500">
            Your notes will be used to guide the AI in generating personalized feedback that addresses your specific points.
          </p>
        </div>

        {/* Feedback Length */}
        <div>
          <label htmlFor="conciseness" className="block text-sm font-medium text-gray-700">
            Feedback Length
          </label>
          <select
            id="conciseness"
            value={conciseness}
            onChange={e => setConciseness(e.target.value as 'concise' | 'detailed')}
            className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        {/* Grade (optional) */}
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
            Grade (optional)
          </label>
          <input
            id="grade"
            type="text"
            value={grade}
            onChange={e => setGrade(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g. 85 or A"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Generating…' : 'Generate Feedback'}
          </button>
        </div>

        {mutation.isError && (
          <div className="text-red-600 mt-2">Error: {mutation.error.message}</div>
        )}
      </form>

      {/* Display generated feedback */}
      {generatedFeedback && (
        <div className="mt-8 p-6 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Generated Feedback</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700">{generatedFeedback.feedback_text}</pre>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => navigate(`/teacher/submissions/${submissionId}/feedback`)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              View All Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
