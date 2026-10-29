import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate('/login')
  }

  const dashboardPath = role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link
              to={isAuthenticated ? dashboardPath : '/'}
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Cogni<span className="text-indigo-600">Campus</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                  Career Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to={dashboardPath}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/student') || location.pathname.startsWith('/recruiter')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* User Role Tag */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.fullName || user?.email || 'User'}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wide ${
                        role === 'recruiter'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {role || 'Role'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/login'
                      ? 'bg-slate-100 text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.fullName || user?.email}
                  </p>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wide ${
                      role === 'recruiter'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {role}
                  </span>
                </div>
              </div>
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
