import React from 'react'
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 sm:p-8 text-white shadow-lg shadow-indigo-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Student Portal Overview Frame
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName || 'Student'}!
            </h1>
            <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
              Track your campus placement journey, explore intelligent skill-readiness metrics, and manage your placement applications.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Scope / Phasing Notice */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-950">
            Frontend Authentication &amp; Layout Phase Complete
          </p>
          <p className="text-blue-800 mt-0.5 leading-relaxed">
            This student workspace contains navigation and layout frames. Full ML placement prediction models, academic profile syncing, and job application pipelines are being actively developed by backend and ML leads for upcoming phases.
          </p>
        </div>
      </div>

      {/* Metric / Feature Frame Cards (Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Academic Record
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Registered</div>
            <p className="text-xs text-slate-500 mt-1">
              Account: {user?.email}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Phase 2: Database profile integration
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Readiness Prediction
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Awaiting ML</div>
            <p className="text-xs text-slate-500 mt-1">
              Predictive career intelligence scoring
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Phase 6: ML Scikit-learn inference pipeline
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Job Drives
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Campus Drives</div>
            <p className="text-xs text-slate-500 mt-1">
              Verified campus hiring opportunities
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Phase 5: Job catalog &amp; applications
          </div>
        </div>
      </div>
    </div>
  )
}
