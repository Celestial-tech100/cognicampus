import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Unauthorized() {
  const { role, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const dashboardPath = role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
            HTTP 403 — Access Denied
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            Unauthorized Access
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            You do not have the required permissions to access this portal. This route is protected by CogniCampus role-based access control.
          </p>
        </div>

        {isAuthenticated && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Current Authenticated Role:{' '}
            <span className="font-bold text-slate-800 uppercase">{role}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          {isAuthenticated ? (
            <Link
              to={dashboardPath}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Return to My Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sign In with Authorized Account</span>
            </Link>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out and Switch Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
