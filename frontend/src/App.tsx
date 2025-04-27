// src/App.tsx
// src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom'

import Layout           from './components/Layout'
import PrivateRoute     from './components/PrivateRoute'
import Login            from './pages/Login'
import Signup           from './pages/Signup'
import About            from './pages/About'
import StudentDashboard from './pages/student/Dashboard'
import TeacherDashboard from './pages/teacher/Dashboard'
import UploadDocument   from './pages/UploadDocument'
import ViewFeedback     from './pages/student/ViewFeedback'
import GenerateFeedback from './pages/teacher/GenerateFeedback'
import ViewSubmissions  from './pages/teacher/ViewSubmissions'



export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/"       element={<Navigate to="/login" replace />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about"  element={<About />} />

        {/* Student-only */}
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <UploadDocument />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/feedback/:submissionId"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <ViewFeedback />
            </PrivateRoute>
          }
        />

        {/* Teacher-only */}
        <Route
          path="/teacher/dashboard"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
           path="/teacher/upload"
           element={
             <PrivateRoute allowedRoles={['teacher']}>
               <UploadDocument />
             </PrivateRoute>
           }
         />
        <Route
          path="/teacher/submissions/:submissionId/feedback"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <GenerateFeedback />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/submissions"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <ViewSubmissions />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
  )
}
