import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import StudentLayout from './layouts/StudentLayout'
import RecruiterLayout from './layouts/RecruiterLayout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'

/**
 * Root Redirector: Routes to respective dashboard if authenticated,
 * or to the Login page if unauthenticated.
 */
function RootRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner fullPage message="Initializing CogniCampus..." />
  }

  if (isAuthenticated) {
    return role === 'recruiter' ? (
      <Navigate to="/recruiter/dashboard" replace />
    ) : (
      <Navigate to="/student/dashboard" replace />
    )
  }

  return <Navigate to="/login" replace />
}

/**
 * PublicOnlyRoute: Prevents logged-in users from re-visiting login/register screens
 * and sends them straight to their authorized portal.
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, role, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner fullPage message="Verifying session..." />
  }

  if (isAuthenticated) {
    return role === 'recruiter' ? (
      <Navigate to="/recruiter/dashboard" replace />
    ) : (
      <Navigate to="/student/dashboard" replace />
    )
  }

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Root Entry Point */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* Protected Student Portal Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
      </Route>

      {/* Protected Recruiter Portal Routes */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
      </Route>

      {/* Security & Fallback Pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
