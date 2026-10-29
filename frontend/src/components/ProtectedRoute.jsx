import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

/**
 * ProtectedRoute component enforces role-based access control (RBAC).
 *
 * NOTE: Frontend routing provides a seamless user experience, but it does NOT
 * replace backend authorization. All critical data endpoints on the FastAPI backend
 * must validate JWT tokens and enforce role dependencies independently.
 *
 * @param {string[]} [allowedRoles] - Optional list of authorized role strings ('student', 'recruiter')
 * @param {React.ReactNode} [children] - Optional child elements (or renders <Outlet />)
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role, isLoading } = useAuth()
  const location = useLocation()

  // 1. While restoring session from storage, display accessible loading state
  if (isLoading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />
  }

  // 2. Unauthenticated user -> redirect to Login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Authenticated but unauthorized role -> redirect to Unauthorized page
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 4. Authorized -> render protected layout / content
  return children ? children : <Outlet />
}
