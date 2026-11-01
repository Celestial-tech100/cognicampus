import React, { useState } from 'react'
import { Link, useNavigate, Outlet, useSearchParams } from 'react-router-dom'
import {
  GraduationCap,
  LayoutDashboard,
  BarChart3,
  PieChart,
  Database,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      id: 'overview',
      name: 'Institutional KPIs',
      path: '/admin/dashboard?tab=overview',
      icon: LayoutDashboard,
      active: activeTab === 'overview',
    },
    {
      id: 'branches',
      name: 'Branch Performance',
      path: '/admin/dashboard?tab=branches',
      icon: BarChart3,
      active: activeTab === 'branches',
    },
    {
      id: 'powerbi',
      name: 'Power BI Intelligence',
      path: '/admin/dashboard?tab=powerbi',
      icon: PieChart,
      active: activeTab === 'powerbi',
    },
    {
      id: 'drives',
      name: 'Campus Placement Drives',
      path: '/admin/dashboard?tab=drives',
      icon: Briefcase,
      active: activeTab === 'drives',
    },
    {
      id: 'sql',
      name: 'SQL Analytics & Views',
      path: '/admin/dashboard?tab=sql',
      icon: Database,
      active: activeTab === 'sql',
    },
    {
      id: 'roster',
      name: 'Candidate Placement Roster',
      path: '/admin/dashboard?tab=roster',
      icon: Users,
      active: activeTab === 'roster',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <Building className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">CogniCampus Admin</span>
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
        <div className="p-5 flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <Link to="/admin/dashboard" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm shadow-purple-200">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                    Cogni<span className="text-purple-600">Campus</span>
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                      ADMIN INTELLIGENCE
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation Section */}
            <div className="mt-6">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Executive Portals
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        item.active
                          ? 'bg-purple-50 text-purple-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          item.active ? 'text-purple-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Quick System Badge */}
            <div className="mt-8 p-3.5 bg-gradient-to-br from-purple-50 to-indigo-50/60 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900">Institutional Hub</span>
              </div>
              <p className="text-[11px] text-purple-700 leading-relaxed">
                Aggregating multi-branch metrics, SQL views, and Power BI telemetry for NAAC/NIRF reporting.
              </p>
            </div>
          </div>

          {/* User Account / Footer */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-purple-50">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.email?.split('@')[0] || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-purple-600 font-medium">Head of Placement</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}

