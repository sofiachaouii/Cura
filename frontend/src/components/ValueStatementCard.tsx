import React from 'react'
import type { ValueStatement } from '../types'

interface ValueStatementCardProps {
  statement: ValueStatement
  onSelectStance: (stance: 'for' | 'against') => void
}

export default function ValueStatementCard({
  statement,
  onSelectStance,
}: ValueStatementCardProps) {
  console.log('ValueStatementCard - statement:', statement)
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Weekly Statement
      </h3>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <p className="text-blue-800 font-medium">{statement.statement}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => onSelectStance('for')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Argue For
        </button>
        <button
          onClick={() => onSelectStance('against')}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Argue Against
        </button>
      </div>
    </div>
  )
} 