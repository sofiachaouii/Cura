import React, { useState } from 'react'
import type { ValueStatement } from '../types'
 
interface ValueResponseFormProps {
  statement: ValueStatement
  stance: 'for' | 'against'
  onSubmit: (response: string) => void
  isSubmitting: boolean
}

export default function ValueResponseForm({
  statement,
  stance,
  onSubmit,
  isSubmitting,
}: ValueResponseFormProps) {
  const [response, setResponse] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (response.trim()) {
      onSubmit(response)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Your Response
      </h3>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <p className="text-blue-800 font-medium">{statement.statement}</p>
        <p className="text-blue-600 text-sm mt-2">
          You are arguing <span className="font-medium">{stance === 'for' ? 'for' : 'against'}</span> this statement.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
            Explain your reasoning:
          </label>
          <textarea
            id="response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Explain why you ${stance === 'for' ? 'agree with' : 'disagree with'} this statement...`}
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !response.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </div>
  )
} 
