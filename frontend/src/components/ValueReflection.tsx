import React from 'react'
import type { ValueReflection } from '../types'

interface ValueReflectionProps {
  reflection: ValueReflection
}

export default function ValueReflection({ reflection }: ValueReflectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        AI Reflection
      </h3>
      <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
        <p className="text-indigo-800">{reflection.reflection}</p>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Your response has been saved. Check back next week for a new value statement to reflect on.</p>
      </div>
    </div>
  )
} 