import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, MessageSquare, Upload, Book, Calendar, CheckCircle, Clock, Brain } from 'lucide-react'
import { student } from '../../services/api'
import { format } from 'date-fns'
import Logo from '../../components/Logo'
import ValueExercise from '../../components/ValueExercise'
import type { Feedback as ApiFeedback } from '../../types'

interface Submission {
  id: string
  documentName: string
  submittedAt: string
  status?: 'pending' | 'reviewed'
}

// Use the API's Feedback type
type Feedback = ApiFeedback

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'feedback'>('submissions')
  
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<Submission[]>({
    queryKey: ['student-submissions'],
    queryFn: student.getMySubmissions,
  })

  const { data: feedback, isLoading: isLoadingFeedback } = useQuery<Feedback[]>({
    queryKey: ['student-feedback'],
    queryFn: student.getMyFeedback,
  })

  const recentSubmissions = submissions?.slice(0, 3) || []
  const recentFeedback = feedback ? feedback.slice(0, 3) : []
  
  const pendingSubmissions = submissions?.filter(s => s.status === 'pending') || []
  const reviewedSubmissions = submissions?.filter(s => s.status === 'reviewed') || []

  return (
    <div className="space-y-6">
      {/* Header with welcome message */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Logo size="lg" showText={false} />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Cura</h1>
            <p className="text-gray-500">Your personal feedback dashboard</p>
          </div>
        </div>
      </div>

      {/* Value Exercise Widget */}
      <ValueExercise />

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{submissions?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Reviewed</p>
              <p className="text-2xl font-semibold text-gray-900">{reviewedSubmissions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingSubmissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for submissions and feedback */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Book className="h-5 w-5 mx-auto mb-1" />
              My Submissions
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-5 w-5 mx-auto mb-1" />
              My Feedback
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'submissions' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Submissions</h2>
                <Link
                  to="/student/upload"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  New Submission
                </Link>
              </div>
              
              {isLoadingSubmissions ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : recentSubmissions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentSubmissions.map((submission) => (
                    <li key={submission.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {submission.documentName || 'Unnamed Document'}
                          </p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">
                              {format(new Date(submission.submittedAt), 'MMM d, yyyy')}
                            </p>
                            {submission.status === 'pending' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                            {submission.status === 'reviewed' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Reviewed
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/student/feedback/${submission.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          View Feedback
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
                  <div className="mt-6">
                    <Link
                      to="/student/upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Document
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Feedback</h2>
              
              {isLoadingFeedback ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : recentFeedback.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentFeedback.map((item: Feedback) => (
                    <li key={item.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            Feedback for {submissions?.find(s => s.id === item.submission_id)?.documentName || 'Document'}
                          </p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">
                              {format(new Date(item.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/student/feedback/${item.submission_id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Feedback will appear here once your submissions are reviewed.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 