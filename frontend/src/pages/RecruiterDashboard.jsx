import React from 'react'
import {
  Building2,
  Briefcase,
  Users,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RecruiterDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-lg shadow-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-sm border border-amber-300/20">
              <Sparkles className="w-3.5 h-3.5" />
              Recruiter Portal Overview Frame
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.fullName || 'Recruiting Partner'}!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage your company job postings, review student applicant pipelines, and evaluate candidates using campus career intelligence.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-8 h-8 text-amber-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Scope / Phasing Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950">
            Frontend Authentication &amp; Layout Phase Complete
          </p>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            This recruiter workspace contains navigation and layout frames. Live job opening management, applicant resume screening, and skill-gap matching pipelines are being developed by backend leads for upcoming phases.
          </p>
        </div>
      </div>

      {/* Metric / Feature Frame Cards (Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Company Partner
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Registered</div>
            <p className="text-xs text-slate-500 mt-1">
              Account: {user?.email}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Phase 2: Recruiter company profile
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Job Postings
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Job Catalog</div>
            <p className="text-xs text-slate-500 mt-1">
              Publish &amp; manage campus openings
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Phase 5: Job openings CRUD
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Applicant Screening
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Candidates</div>
            <p className="text-xs text-slate-500 mt-1">
              Match score &amp; applicant tracking
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Phase 5: Application workflow
          </div>
        </div>
      </div>
    </div>
  )
}
