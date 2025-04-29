import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { student } from '../services/api'
import type { ValueStatement, ValueReflection as ValueReflectionType } from '../types'
import ValueStatementCard from './ValueStatementCard'
import ValueResponseForm from './ValueResponseForm'
import ValueReflection from './ValueReflection' 

export default function ValueExercise() {
  const [selectedStance, setSelectedStance] = useState<'for' | 'against' | null>(null)
  const [currentStatement, setCurrentStatement] = useState<ValueStatement | null>(null)
  const [reflection, setReflection] = useState<ValueReflectionType | null>(null)

  // Check if the user has already completed this week's exercise
  const hasCompletedThisWeek = localStorage.getItem('lastValueExerciseDate') === getCurrentWeekKey()

  // Fetch the next value statement
  const { data: statement, isLoading, error } = useQuery<ValueStatement>({
    queryKey: ['valueStatement'],
    queryFn: () => student.getNextValueStatement(),
    enabled: !hasCompletedThisWeek && !currentStatement && !reflection,
  })

  // Add debugging logs
  console.log('ValueExercise - hasCompletedThisWeek:', hasCompletedThisWeek)
  console.log('ValueExercise - isLoading:', isLoading)
  console.log('ValueExercise - error:', error)
  console.log('ValueExercise - statement:', statement)
  console.log('ValueExercise - currentStatement:', currentStatement)
  console.log('ValueExercise - reflection:', reflection)

  // Update current statement when data is fetched
  React.useEffect(() => {
    if (statement) {
      setCurrentStatement(statement)
    }
  }, [statement])

  // Submit the student's response
  const submitMutation = useMutation<ValueReflectionType, Error, { response: string }>({
    mutationFn: ({ response }) => {
      if (!currentStatement) {
        throw new Error('No statement selected')
      }
      return student.submitValueResponse(
        currentStatement.id,
        selectedStance as 'for' | 'against',
        response
      )
    },
    onSuccess: (data) => {
      setReflection(data)
      // Save the completion date to prevent showing the exercise again this week
      localStorage.setItem('lastValueExerciseDate', getCurrentWeekKey())
    },
  })

  // Handle stance selection
  const handleSelectStance = (stance: 'for' | 'against') => {
    setSelectedStance(stance)
  }

  // Handle response submission
  const handleSubmitResponse = (response: string) => {
    submitMutation.mutate({ response })
  }

  // If the user has already completed this week's exercise, don't show anything
  if (hasCompletedThisWeek && !reflection) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-red-600">
          <p>Error loading value statement: {error.message}</p>
        </div>
      </div>
    )
  }

  // Show reflection if available
  if (reflection) {
    return <ValueReflection reflection={reflection} />
  }

  // Show response form if stance is selected
  if (selectedStance && currentStatement) {
    return (
      <ValueResponseForm
        statement={currentStatement}
        stance={selectedStance}
        onSubmit={handleSubmitResponse}
        isSubmitting={submitMutation.isPending}
      />
    )
  }

  // Show statement card if available
  if (currentStatement) {
    return (
      <ValueStatementCard
        statement={currentStatement}
        onSelectStance={handleSelectStance}
      />
    )
  }

  // Fallback
  return null
}

// Helper function to get a unique key for the current week
function getCurrentWeekKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekNumber = Math.floor((day - 1) / 7) + 1
  return `${year}-${month}-${weekNumber}`
} 
