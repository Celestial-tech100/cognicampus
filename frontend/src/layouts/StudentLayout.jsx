import React, { useState } from 'react'
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom'
import {
  GraduationCap,
  LayoutDashboard,
  User,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bell,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      name: 'Overview',
      path: '/student/dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/student/dashboard',
    },
    {
      name: 'Student Profile',
      path: '#profile',
      icon: User,
      active: false,
      placeholder: true,
    },
    {
      name: 'Career Readiness',
      path: '#readiness',
      icon: TrendingUp,
      active: false,
      placeholder: true,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link to="/student/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">CogniCampus</span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Frame */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5">
          {/* Logo */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <Link to="/student/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Cogni<span className="text-indigo-600">Campus</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Student Portal
                </span>
              </div>
            </Link>
            <button
              className="md:hidden text-slate-400 hover:text-slate-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section heading */}
          <div className="mt-6 mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Student Dashboard
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.name} className="relative">
                  {item.placeholder ? (
                    <div
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 cursor-not-allowed group transition-colors"
                      title="Module placeholder (Assigned to teammate)"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">
                        Soon
                      </span>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        item.active
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          item.active ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer with user badge and logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.fullName || 'Student User'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between">
          <h1 className="text-base font-bold text-slate-800">
            Student Career Intelligence Workspace
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Authenticated as Student
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
