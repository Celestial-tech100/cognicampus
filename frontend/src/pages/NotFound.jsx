import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const { isAuthenticated, role } = useAuth()
  const dashboardPath = role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            HTTP 404 — Not Found
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="pt-2">
          {isAuthenticated ? (
            <Link
              to={dashboardPath}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
