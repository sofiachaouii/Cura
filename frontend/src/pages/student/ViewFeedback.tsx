import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { student } from '../../services/api'
import { Feedback } from '../../types'
import { format } from 'date-fns'

export default function ViewFeedback() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const [question, setQuestion] = useState('')
  const queryClient = useQueryClient()

  const { data: feedback, isLoading, error } = useQuery({
    queryKey: ['feedback', submissionId],
    queryFn: () => student.getFeedbackForSubmission(submissionId!),
    enabled: !!submissionId,
  })

  const chatMutation = useMutation({
    mutationFn: () => student.askFollowUp(submissionId!, question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', submissionId] })
      setQuestion('')
    },
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading feedback: {(error as Error).message}
      </div>
    )
  }

  if (!feedback || feedback.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No Feedback Yet</h2>
          <p className="mt-2 text-gray-600">
            Your teacher hasn't provided feedback for this submission yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feedback</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="prose max-w-none">
          <h2 className="text-lg font-semibold mb-4">Generated Feedback</h2>
          <div className="whitespace-pre-wrap">{feedback.feedback_text}</div>
        </div>
      </div>

      {/* Chat-back input */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Ask a follow-up question</h2>
        <textarea
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g. Can you give me one more tip on grammar?"
        />
        <button
          onClick={() => chatMutation.mutate()}
          disabled={!question || chatMutation.isPending}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {chatMutation.isPending ? '…sending' : 'Send'}
        </button>
        {chatMutation.isError && (
          <p className="text-red-600 mt-2">Error sending question.</p>
        )}
      </div>
    </div>
  )
}
