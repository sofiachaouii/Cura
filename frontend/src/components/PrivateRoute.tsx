import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface PrivateRouteProps { 
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function PrivateRoute({ children, allowedRoles = [] }: PrivateRouteProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
} 
