import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  X,
  ExternalLink,
  Code,
  Layers,
} from 'lucide-react'
import api from '../services/api'

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([])
  const [filteredCandidates, setFilteredCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('ALL')
  const [selectedRole, setSelectedRole] = useState('ALL')
  const [minCgpa, setMinCgpa] = useState(0)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/recruiter/candidates')
      const candidateList = response.data?.candidates || []
      setCandidates(candidateList)
      setFilteredCandidates(candidateList)
    } catch (err) {
      console.error('Failed to fetch candidate pool:', err)
      if (err.status === 401 || err.response?.status === 401) {
        setError('Your recruiter session has expired or is invalid. Please sign in again.')
      } else {
        setError(err.message || 'Failed to load candidates from server. Ensure backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter pipeline
  useEffect(() => {
    let result = [...candidates]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.branch?.toLowerCase().includes(q) ||
          c.skills?.toLowerCase().includes(q) ||
          c.predicted_role?.toLowerCase().includes(q)
      )
    }

    if (selectedBranch !== 'ALL') {
      result = result.filter((c) => c.branch === selectedBranch)
    }

    if (selectedRole !== 'ALL') {
      result = result.filter((c) => c.predicted_role === selectedRole)
    }

    if (minCgpa > 0) {
      result = result.filter((c) => (c.cgpa || 0) >= minCgpa)
    }

    setFilteredCandidates(result)
  }, [searchQuery, selectedBranch, selectedRole, minCgpa, candidates])

  const branches = ['ALL', ...new Set(candidates.map((c) => c.branch).filter(Boolean))]
  const roles = ['ALL', ...new Set(candidates.map((c) => c.predicted_role).filter(Boolean))]

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Corporate Talent Acquisition
              </span>
              <span className="text-xs text-indigo-200">Campus Cohort 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recruiter Screening & ML Talent Engine
            </h1>
            <p className="text-sm text-indigo-200/80 mt-1 max-w-2xl">
              Screen verified student profiles enriched with Scikit-Learn career trajectory
              predictions, cross-disciplinary versatility ratings, and validated technical skills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCandidates}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Refresh Pool</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, skill, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Branch Dropdown */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b === 'ALL' ? 'All Engineering Branches' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r === 'ALL' ? 'All Predicted Roles' : r}
                </option>
              ))}
            </select>
          </div>

          {/* Min CGPA Slider */}
          <div className="flex flex-col justify-center px-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Minimum CGPA:</span>
              <span className="text-indigo-600 font-bold">{minCgpa > 0 ? minCgpa : 'Any'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="9.5"
              step="0.5"
              value={minCgpa}
              onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Results Count & Badges */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{filteredCandidates.length}</span>
            <span>candidates match screening criteria</span>
          </div>

          {(selectedBranch !== 'ALL' || selectedRole !== 'ALL' || minCgpa > 0 || searchQuery) && (
            <button
              onClick={() => {
                setSelectedBranch('ALL')
                setSelectedRole('ALL')
                setMinCgpa(0)
                setSearchQuery('')
              }}
              className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Candidate Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <p className="font-semibold text-slate-700">Loading candidate intelligence pool...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 text-sm max-w-lg mx-auto space-y-3">
          <p className="font-semibold">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={fetchCandidates}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
            >
              Retry Loading
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('cognicampus_token')
                localStorage.removeItem('token')
                window.location.href = '/login'
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Re-Login as Recruiter
            </button>
          </div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
          <p className="font-bold text-slate-800">No candidates match your current filters</p>
          <p className="text-xs text-slate-400">Try broadening your CGPA threshold or branch selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((candidate) => {
            const isDev = candidate.predicted_role === 'Software Developer'
            const isAnalyst = candidate.predicted_role === 'Data Analyst'

            // Check if student is a Versatile Polymath (balanced multi-track probabilities)
            const isVersatile =
              candidate.recommendations &&
              candidate.recommendations.length > 1 &&
              candidate.recommendations[1].score >= 0.25

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Avatar & CGPA */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0 border border-indigo-100">
                        {candidate.full_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {candidate.full_name}
                        </h3>
                        <p className="text-xs text-slate-500">{candidate.branch}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs shrink-0">
                      {candidate.cgpa?.toFixed(2)} CGPA
                    </span>
                  </div>

                  {/* ML Prediction Badge */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">ML Predicted Role:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          isDev
                            ? 'bg-indigo-100 text-indigo-800'
                            : isAnalyst
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {candidate.predicted_role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Top Match Fit:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">
                          {candidate.readiness_score}%
                        </span>
                        {isVersatile && (
                          <span
                            title="Versatile Polymath: Skills span multiple disciplines simultaneously."
                            className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded"
                          >
                            Multi-Track
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Versatile Profile Pill */}
                    {isVersatile && (
                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-purple-700 font-semibold">
                        <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>Versatile Profile • Dual-Track Competency</span>
                      </div>
                    )}
                  </div>

                  {/* Skills Pills */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Core Technical Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.skill_list?.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {(candidate.skill_list?.length || 0) > 4 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500">
                          +{candidate.skill_list.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(candidate)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>View ML Insights</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Candidate ML Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedCandidate.full_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCandidate.branch} • {selectedCandidate.cgpa?.toFixed(2)} CGPA
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Primary Match Card */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-600 font-semibold block">
                    Top Career Recommendation:
                  </span>
                  <span className="text-lg font-extrabold text-indigo-950">
                    {selectedCandidate.predicted_role}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-indigo-600 font-semibold block">
                    Top Role Fit:
                  </span>
                  <span className="text-xl font-extrabold text-indigo-700">
                    {selectedCandidate.readiness_score}%
                  </span>
                </div>
              </div>

              {/* Explanatory Alert on Multi-class Softmax */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  How Model Probability Works:
                </span>
                This percentage represents the classifier's categorical probability distribution across 3
                domains, summing to 100%. Single-track specialists show high confidence in one bucket (~85%).
                Candidates with diverse, cross-cutting skills (e.g., Docker, FastAPI, React, SQL, 9.1 CGPA)
                naturally divide probability across multiple tracks, designating them as high-demand{' '}
                <strong>Versatile Polymaths</strong>.
              </div>

              {/* Trajectory Probabilities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Scikit-Learn Classifier Trajectory Probabilities (Sum = 100%):
                </h4>
                <div className="space-y-2">
                  {selectedCandidate.recommendations?.map((item) => (
                    <div key={item.career_path} className="p-2.5 bg-slate-50 rounded-lg">
                      <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span>{item.career_path}</span>
                        <span className="font-bold text-slate-900">
                          {Math.round(item.score * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${Math.round(item.score * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  All Registered Technical Skills:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skill_list?.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
