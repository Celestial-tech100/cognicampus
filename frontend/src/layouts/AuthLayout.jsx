import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { GraduationCap, Sparkles, ShieldCheck, TrendingUp, Building2 } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Cogni<span className="text-indigo-600">Campus</span>
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                Career Intelligence
              </span>
            </div>
          </Link>

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Campus Placement &amp; Career Intelligence Platform
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Brand Feature Column (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Campus Intelligence
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Bridge the Gap Between <span className="text-indigo-600">Talent</span> and <span className="text-indigo-600">Industry</span>.
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              CogniCampus empowers students with predictive placement-readiness modeling and connects recruiters to qualified campus candidates.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800">Verified Academic Profiles</h2>
                  <p className="text-xs text-slate-500">Authenticated student records and credential-based access control.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800">Career Readiness Intelligence</h2>
                  <p className="text-xs text-slate-500">Benchmark skills against real-time recruiter requirements.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800">Streamlined Campus Hiring</h2>
                  <p className="text-xs text-slate-500">Recruiters discover and shortlist candidates with data-driven precision.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card Column */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 sm:p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} CogniCampus. All rights reserved. Platform security enforced via FastAPI &amp; JWT.</p>
      </footer>
    </div>
  )
}
