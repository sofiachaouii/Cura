// src/pages/teacher/Dashboard.tsx

import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Document } from '../../types'
import { AlertCircle, FileText, Users, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'            // ← import your api instance

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const {
    data: submissions = [],
    isLoading,
    error,
  } = useQuery<Document[], Error>({
    queryKey: ['all-submissions'],
    queryFn: () =>
      api
        .get<Document[]>('/upload/all-submissions')  // ← call api, not axios
        .then(res => res.data),
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            {[0,1,2].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md flex items-center space-x-2 rounded bg-red-50 p-4 text-red-700">
        <AlertCircle className="h-5 w-5" />
        <span>{error.message}</span>
      </div>
    )
  }

  const uniqueStudents = new Set(submissions.map(s => s.studentId)).size
  const pending  = submissions.filter(d => d.status === 'pending')
  const reviewed = submissions.filter(d => d.status === 'reviewed')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 h-16">
          <h1 className="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="card flex items-center">
            <div className="rounded-md bg-blue-500 p-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Total Documents</div>
              <div className="text-lg font-semibold text-gray-900">{submissions.length}</div>
            </div>
          </div>

          <div className="card flex items-center">
            <div className="rounded-md bg-green-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Total Students</div>
              <div className="text-lg font-semibold text-gray-900">{uniqueStudents}</div>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Documents</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {submissions.slice(0,5).map(doc => (
                <li key={doc.id}>
                  <div className="flex justify-between px-4 py-4 sm:px-6">
                    <span className="text-sm font-medium text-blue-600 truncate">{doc.documentName}</span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 pb-4 sm:px-6 text-sm text-gray-500">
                    <span>{doc.studentName}</span>
                    <span>{new Date(doc.submittedAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Review Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Pending Reviews</h3>
            {pending.length > 0 ? (
              <div className="space-y-4">
                {pending.map(doc => (
                  <div key={doc.id} className="flex justify-between p-4 bg-white rounded-lg shadow border">
                    <div>
                      <h4 className="font-medium">{doc.documentName}</h4>
                      <p className="text-sm text-gray-500">By {doc.studentName}</p>
                      <p className="text-sm text-gray-500">
                        Submitted {new Date(doc.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/teacher/submissions/${doc.id}/feedback`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Generate Feedback
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending documents to review</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
            {reviewed.length > 0 ? (
              <div className="space-y-4">
                {reviewed.map(doc => (
                  <div key={doc.id} className="flex justify-between p-4 bg-white rounded-lg shadow border">
                    <div>
                      <h4 className="font-medium">{doc.documentName}</h4>
                      <p className="text-sm text-gray-500">By {doc.studentName}</p>
                      <p className="text-sm text-gray-500">
                        Reviewed {new Date(doc.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/teacher/submissions?documentId=${doc.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviewed documents yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
)
}
