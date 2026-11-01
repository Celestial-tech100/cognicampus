import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  TrendingUp,
  Award,
  DollarSign,
  Building2,
  Users,
  Database,
  PieChart,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  Code2,
  Copy,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Plus,
  Download,
  Calendar,
  Briefcase,
  Edit3,
  X,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import api from '../services/api'

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Core Data
  const [overviewData, setOverviewData] = useState(null)
  const [branchData, setBranchData] = useState([])
  const [candidates, setCandidates] = useState([])
  const [drives, setDrives] = useState([])

  // Filters for Power BI & Roster
  const [selectedBranch, setSelectedBranch] = useState('ALL')
  const [rosterSearch, setRosterSearch] = useState('')
  const [rosterStatusFilter, setRosterStatusFilter] = useState('ALL')
  const [copiedQueryIndex, setCopiedQueryIndex] = useState(null)

  // Modals State
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [placementForm, setPlacementForm] = useState({
    placement_status: 'Placed',
    company_name: '',
    package_lpa: 8.5,
  })

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [addStudentForm, setAddStudentForm] = useState({
    full_name: '',
    email: '',
    branch: 'Computer Science',
    cgpa: 8.2,
    skills: 'Python, SQL, React',
  })

  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false)
  const [driveForm, setDriveForm] = useState({
    company_name: '',
    role_title: '',
    package_lpa: 10.0,
    min_cgpa: 7.5,
    eligible_branches: 'Computer Science, Information Technology',
    drive_date: '2026-05-15',
    status: 'Upcoming',
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [overviewRes, branchRes, candidateRes, drivesRes] = await Promise.all([
        api.get('/analytics/overview').catch((err) => {
          console.error('Failed to load analytics overview:', err)
          return { data: null }
        }),
        api.get('/analytics/branch-placement-rates').catch((err) => {
          console.error('Failed to load branch placement rates:', err)
          return { data: [] }
        }),
        api.get('/recruiter/candidates').catch((err) => {
          console.error('Failed to load candidate roster:', err)
          return { data: { candidates: [] } }
        }),
        api.get('/admin/drives').catch((err) => {
          console.error('Failed to load campus drives:', err)
          return { data: { drives: [] } }
        }),
      ])

      setOverviewData(overviewRes?.data || null)
      setBranchData(Array.isArray(branchRes?.data) ? branchRes.data : [])
      setCandidates(
        Array.isArray(candidateRes?.data?.candidates)
          ? candidateRes.data.candidates
          : Array.isArray(candidateRes?.data)
          ? candidateRes.data
          : []
      )
      setDrives(Array.isArray(drivesRes?.data?.drives) ? drivesRes.data.drives : [])
    } catch (err) {
      console.error('Error fetching institutional analytics:', err)
      if (err.status === 401 || err.response?.status === 401) {
        setError('Institutional administration session expired. Please sign in again.')
      } else {
        setError(err.message || 'Unable to load institutional analytics. Ensure backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId })
  }

  const handleCopySQL = (sqlText, idx) => {
    navigator.clipboard.writeText(sqlText)
    setCopiedQueryIndex(idx)
    setTimeout(() => setCopiedQueryIndex(null), 2000)
  }

  // 1. Export NAAC Criterion 5.2.1 CSV Report
  const handleExportCSV = () => {
    if (!candidates || candidates.length === 0) {
      alert('No cohort records available to export.')
      return
    }

    const headers = [
      'Student Name',
      'Email',
      'Branch',
      'CGPA',
      'Verified Skills',
      'Placement Status',
      'Hiring Company',
      'Package (LPA)',
      'ML Recommended Career Track',
      'Prediction Confidence',
    ]

    const rows = candidates.map((c) => [
      `"${c.full_name || 'N/A'}"`,
      `"${c.email || 'N/A'}"`,
      `"${c.branch || 'N/A'}"`,
      c.cgpa || 0,
      `"${c.skills || 'N/A'}"`,
      `"${c.placement_status || 'Seeking Placement'}"`,
      `"${c.company_name || 'N/A'}"`,
      c.package_lpa || '0',
      `"${c.predicted_role || 'General'}"`,
      `"${c.prediction_confidence || c.readiness_score || 0}%"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `CogniCampus_NAAC_Placement_Report_2026.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('NAAC Criterion 5.2.1 report exported successfully as CSV!')
  }

  // 2. Open Placement Offer Updater
  const handleOpenPlacementModal = (cand) => {
    setEditingCandidate(cand)
    setPlacementForm({
      placement_status: cand.placement_status === 'Placed' ? 'Placed' : 'Placed',
      company_name: cand.company_name || 'Microsoft',
      package_lpa: cand.package_lpa || 10.0,
    })
    setIsPlacementModalOpen(true)
  }

  const handleSavePlacement = async (e) => {
    e.preventDefault()
    if (!editingCandidate) return

    try {
      await api.put(`/admin/placements/${editingCandidate.id}`, {
        placement_status: placementForm.placement_status,
        company_name: placementForm.company_name,
        package_lpa: parseFloat(placementForm.package_lpa) || 0,
      })
      showToast(`Placement status updated for ${editingCandidate.full_name}!`)
      setIsPlacementModalOpen(false)
      fetchDashboardData()
    } catch (err) {
      alert(`Failed to update placement: ` + (err.message || 'Server error'))
    }
  }

  // 3. Add Student Modal
  const handleAddStudent = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/students', {
        full_name: addStudentForm.full_name,
        email: addStudentForm.email,
        branch: addStudentForm.branch,
        cgpa: parseFloat(addStudentForm.cgpa) || 7.5,
        skills: addStudentForm.skills,
        password: 'password123',
      })
      showToast(`Student ${addStudentForm.full_name} enrolled and evaluated with ML model!`)
      setIsAddStudentModalOpen(false)
      setAddStudentForm({
        full_name: '',
        email: '',
        branch: 'Computer Science',
        cgpa: 8.2,
        skills: 'Python, SQL, React',
      })
      fetchDashboardData()
    } catch (err) {
      alert(`Failed to add student: ` + (err.message || 'Server error'))
    }
  }

  // 4. Create Campus Drive
  const handleCreateDrive = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/drives', {
        company_name: driveForm.company_name,
        role_title: driveForm.role_title,
        package_lpa: parseFloat(driveForm.package_lpa) || 8.0,
        min_cgpa: parseFloat(driveForm.min_cgpa) || 7.0,
        eligible_branches: driveForm.eligible_branches,
        drive_date: driveForm.drive_date,
        status: driveForm.status,
      })
      showToast(`Campus Drive for ${driveForm.company_name} announced!`)
      setIsDriveModalOpen(false)
      setDriveForm({
        company_name: '',
        role_title: '',
        package_lpa: 10.0,
        min_cgpa: 7.5,
        eligible_branches: 'Computer Science, Information Technology',
        drive_date: '2026-05-15',
        status: 'Upcoming',
      })
      fetchDashboardData()
    } catch (err) {
      alert(`Failed to announce drive: ` + (err.message || 'Server error'))
    }
  }

  // Filtered roster
  const filteredCandidates = (candidates || []).filter((c) => {
    const candidateName = c?.full_name || ''
    const candidateEmail = c?.email || ''
    const candidateBranch = c?.branch || ''
    const q = (rosterSearch || '').toLowerCase()
    const matchesSearch =
      candidateName.toLowerCase().includes(q) ||
      candidateEmail.toLowerCase().includes(q) ||
      candidateBranch.toLowerCase().includes(q)
    const matchesBranch = selectedBranch === 'ALL' || candidateBranch === selectedBranch
    const matchesStatus =
      rosterStatusFilter === 'ALL' ||
      (rosterStatusFilter === 'Placed' && c?.placement_status === 'Placed') ||
      (rosterStatusFilter === 'Unplaced' && c?.placement_status !== 'Placed')
    return matchesSearch && matchesBranch && matchesStatus
  })

  // SQL queries showcase for Tab 5
  const sqlShowcases = [
    {
      title: 'Institutional Placement Overview View (vw_placement_overview)',
      description: 'Used for annual reports, NIRF criterion reporting, and executive high-level cards.',
      code: `CREATE OR REPLACE VIEW vw_placement_overview AS
SELECT s.graduation_year,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(DISTINCT CASE WHEN p.placement_status = 'Placed' THEN s.student_id END) AS placed_students,
    ROUND(
        COUNT(DISTINCT CASE WHEN p.placement_status = 'Placed' THEN s.student_id END) * 100.0 
        / NULLIF(COUNT(DISTINCT s.student_id), 0), 2
    ) AS placement_rate,
    ROUND(AVG(CASE WHEN p.placement_status = 'Placed' THEN s.cgpa END), 2) AS average_placed_cgpa,
    ROUND(AVG(CASE WHEN p.placement_status = 'Placed' THEN p.package_lpa END), 2) AS average_package_lpa,
    ROUND(MAX(CASE WHEN p.placement_status = 'Placed' THEN p.package_lpa END), 2) AS highest_package_lpa
FROM students s
LEFT JOIN placements p ON s.student_id = p.student_id
GROUP BY s.graduation_year;`,
    },
    {
      title: 'Branch-wise Performance Query (NAAC Criterion 5.2.1)',
      description: 'Calculates departmental placement rate, student distribution, and average package.',
      code: `SELECT 
    s.branch,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT CASE WHEN p.placement_status = 'Placed' THEN p.student_id END) AS placed_students,
    ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN p.placement_status = 'Placed' THEN p.student_id END) 
        / NULLIF(COUNT(DISTINCT s.id), 0), 2
    ) AS placement_percentage,
    ROUND(AVG(s.cgpa), 2) AS average_cgpa,
    ROUND(AVG(p.package_lpa), 2) AS average_package_lpa,
    ROUND(MAX(p.package_lpa), 2) AS highest_package_lpa
FROM student_profiles s
LEFT JOIN placements p ON s.id = p.student_id
GROUP BY s.branch
ORDER BY placement_percentage DESC;`,
    },
    {
      title: 'Salary Tier Distribution Analytics (Dream vs Core vs Mass)',
      description: 'Categorizes packages into Dream (>10 LPA), Core Engineering (6-10 LPA), and Mass tiers.',
      code: `SELECT 
    CASE 
        WHEN p.package_lpa >= 10.0 THEN 'Dream Offers (>10 LPA)'
        WHEN p.package_lpa >= 6.0 THEN 'Core Offers (6-10 LPA)'
        ELSE 'Mass / Standard (<6 LPA)'
    END AS salary_tier,
    COUNT(p.id) AS offer_count,
    ROUND(AVG(p.package_lpa), 2) AS tier_average_lpa
FROM placements p
WHERE p.placement_status = 'Placed'
GROUP BY salary_tier
ORDER BY tier_average_lpa DESC;`,
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Generating Institutional Intelligence...</h2>
        <p className="text-sm text-slate-500 mt-1">Aggregating departmental metrics, SQL views, and cohort data</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center max-w-xl mx-auto my-12">
        <p className="text-rose-700 font-medium mb-3">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Institutional Administration
              </span>
              <span className="text-xs text-slate-300">Cohort {overviewData?.graduation_cohort || 2026}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Campus Placement & Intelligence Analytics
            </h1>
            <p className="text-sm text-purple-200/80 mt-1 max-w-2xl">
              Comprehensive institutional management portal: oversee campus recruitment drives, award
              offers, audit departmental SQL telemetry, and export accreditation compliance reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export NAAC CSV</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Executive KPIs', icon: LayoutDashboard },
          { id: 'branches', label: 'Branch Performance', icon: BarChart3 },
          { id: 'powerbi', label: 'Power BI Intelligence', icon: PieChart },
          { id: 'drives', label: 'Campus Placement Drives', icon: Briefcase },
          { id: 'sql', label: 'SQL Analytical Views', icon: Database },
          { id: 'roster', label: 'Candidate Placement Roster', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: OVERVIEW & INSTITUTIONAL KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Placement Rate
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">
                  {overviewData?.placement_rate_percentage || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${overviewData?.placement_rate_percentage || 0}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Total Placed
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900">
                  {overviewData?.placed_students || 0}
                </span>
                <span className="text-xs text-slate-400">/ {overviewData?.total_registered_students || 0}</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {overviewData?.unplaced_students || 0} active seeking
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Average Package
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-purple-700">
                  {overviewData?.average_package_lpa || 0}
                </span>
                <span className="text-xs text-slate-500 font-semibold">LPA</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Across all offers</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Highest Package
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-indigo-700">
                  {overviewData?.highest_package_lpa || 0}
                </span>
                <span className="text-xs text-slate-500 font-semibold">LPA</span>
              </div>
              <p className="text-[11px] text-indigo-600 font-medium mt-1">Microsoft Offer</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Cohort Avg CGPA
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">
                  {overviewData?.institutional_average_cgpa || 0}
                </span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Academic benchmark</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Dream Offers
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-600">
                  {overviewData?.package_tiers?.dream_offers_gt_10lpa || 0}
                </span>
                <span className="text-xs text-amber-600 font-medium">&gt; 10 LPA</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Tier 1 recruiting</p>
            </div>
          </div>

          {/* Middle Row: Salary Tiers & Top Recruiters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Salary Tier Breakdown Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Salary Tier Distribution
                  </h3>
                  <span className="text-xs text-slate-400">Cohort 2026</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Categorization of compensation offers into institutional tiers for NAAC & placement audit.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Dream Offers (&gt; 10 LPA)
                      </span>
                      <span className="text-slate-700">
                        {overviewData?.package_tiers?.dream_offers_gt_10lpa || 0} Offers
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{
                          width: `${
                            overviewData?.placed_students
                              ? ((overviewData?.package_tiers?.dream_offers_gt_10lpa || 0) /
                                  overviewData.placed_students) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-purple-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                        Core Engineering (6 - 10 LPA)
                      </span>
                      <span className="text-slate-700">
                        {overviewData?.package_tiers?.core_offers_6_to_10lpa || 0} Offers
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${
                            overviewData?.placed_students
                              ? ((overviewData?.package_tiers?.core_offers_6_to_10lpa || 0) /
                                  overviewData.placed_students) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-blue-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Mass / Standard (&lt; 6 LPA)
                      </span>
                      <span className="text-slate-700">
                        {overviewData?.package_tiers?.mass_offers_lt_6lpa || 0} Offers
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            overviewData?.placed_students
                              ? ((overviewData?.package_tiers?.mass_offers_lt_6lpa || 0) /
                                  overviewData.placed_students) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total Active Offers</span>
                <span className="font-bold text-slate-800">{overviewData?.placed_students || 0} Placed</span>
              </div>
            </div>

            {/* Top Recruiting Companies Leaderboard */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Key Campus Recruitment Partners
                </h3>
                <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold">
                  Verified Drives
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Leading organizations conducting on-campus evaluations and offering confirmed packages.
              </p>

              <div className="divide-y divide-slate-100">
                {overviewData?.top_recruiting_companies?.map((company, idx) => (
                  <div key={company.name} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{company.name}</p>
                        <p className="text-[11px] text-slate-400">Campus Corporate Partner</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-700">{company.avg_package} LPA</p>
                      <p className="text-[11px] text-slate-500">{company.hires} Selection</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCH PERFORMANCE */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Branch-wise Placement Performance</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Cross-departmental comparison of placement percentage, candidate volume, and package dynamics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Total Branches:</span>
                <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-xs">
                  {branchData.length} Departments
                </span>
              </div>
            </div>

            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {branchData.map((branch) => (
                <div
                  key={branch.branch}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-xs transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white text-purple-700 border border-slate-200 shadow-2xs">
                      {branch.branch}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {branch.placement_percentage}% Placed
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${branch.placement_percentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Students</span>
                      <span className="font-bold text-slate-800">
                        {branch.placed_students} / {branch.total_students}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg CGPA</span>
                      <span className="font-bold text-slate-800">{branch.average_cgpa}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Package</span>
                      <span className="font-bold text-purple-700">{branch.average_package_lpa} LPA</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Highest</span>
                      <span className="font-bold text-indigo-700">{branch.highest_package_lpa} LPA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Department Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Academic Branch</th>
                    <th className="py-3 px-4">Total Students</th>
                    <th className="py-3 px-4">Placed Count</th>
                    <th className="py-3 px-4">Placement Rate</th>
                    <th className="py-3 px-4">Average CGPA</th>
                    <th className="py-3 px-4">Average Package</th>
                    <th className="py-3 px-4">Highest Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchData.map((b) => (
                    <tr key={b.branch} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{b.branch}</td>
                      <td className="py-3 px-4 text-slate-600">{b.total_students}</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">{b.placed_students}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700">
                          {b.placement_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{b.average_cgpa}</td>
                      <td className="py-3 px-4 text-purple-700 font-bold">{b.average_package_lpa} LPA</td>
                      <td className="py-3 px-4 text-indigo-700 font-bold">{b.highest_package_lpa} LPA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POWER BI PLACEMENT INTELLIGENCE STUDIO */}
      {activeTab === 'powerbi' && (
        <div className="space-y-6">
          {/* Power BI Workspace Header */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-lg">
                PBI
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  CogniCampus Power BI Executive Intelligence Report
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Live BI Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Direct DAX visual metrics, slicers, and interactive cohort filtration model.
                </p>
              </div>
            </div>

            {/* Slicer Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <span className="text-slate-400">Branch Slicer:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-800">
                    All Branches
                  </option>
                  {branchData.map((b) => (
                    <option key={b.branch} value={b.branch} className="bg-slate-800">
                      {b.branch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <span className="text-slate-400">Cohort:</span>
                <span className="text-amber-400 font-bold">2026</span>
              </div>
            </div>
          </div>

          {/* Simulated Power BI Interactive Visual Canvas */}
          <div className="bg-slate-100 rounded-xl border border-slate-300 p-6 shadow-inner space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-amber-500" />
                  Report Page 1: Institutional Executive Dashboard
                </span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <span className="hidden sm:inline text-slate-500">Dataset: CogniCampus_MySQL_Warehouse</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-700 text-[11px]">DirectQuery Connected</span>
              </div>
            </div>

            {/* Power BI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border-t-4 border-amber-500 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Placement Rate</p>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {overviewData?.placement_rate_percentage}%
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">▲ +8.2% vs Previous Cohort</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-t-4 border-purple-500 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg CTC Package</p>
                <p className="text-3xl font-black text-purple-700 mt-1">
                  ₹{overviewData?.average_package_lpa} <span className="text-sm font-semibold">LPA</span>
                </p>
                <p className="text-[10px] text-purple-600 font-bold mt-1">▲ Highest ₹{overviewData?.highest_package_lpa} LPA</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-t-4 border-blue-500 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Evaluated</p>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {overviewData?.total_registered_students}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Active Batch Profiles</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-t-4 border-emerald-500 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offers Released</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  {overviewData?.placed_students}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">Confirmed Letter Status</p>
              </div>
            </div>

            {/* Graphical Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-xs border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Placement % by Academic Department</h4>
                  <span className="text-[11px] text-slate-400">DAX: [Placement_Rate_Pct]</span>
                </div>
                <div className="space-y-3">
                  {branchData
                    .filter((b) => selectedBranch === 'ALL' || b.branch === selectedBranch)
                    .map((branch) => (
                      <div key={branch.branch}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700">{branch.branch}</span>
                          <span className="text-purple-700">{branch.placement_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${branch.placement_percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-xs border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Compensation Tier Distribution (LPA)</h4>
                  <span className="text-[11px] text-slate-400">DAX: [Tier_Volume_Count]</span>
                </div>

                <div className="flex items-end justify-around h-44 pt-4 border-b border-slate-200">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-amber-600">
                      {overviewData?.package_tiers?.dream_offers_gt_10lpa}
                    </span>
                    <div
                      className="w-14 bg-amber-500 rounded-t-md transition-all duration-500"
                      style={{
                        height: `${Math.max(
                          20,
                          ((overviewData?.package_tiers?.dream_offers_gt_10lpa || 0) /
                            (overviewData?.placed_students || 1)) *
                            100
                        )}px`,
                      }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">&gt; 10 LPA</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-purple-600">
                      {overviewData?.package_tiers?.core_offers_6_to_10lpa}
                    </span>
                    <div
                      className="w-14 bg-purple-600 rounded-t-md transition-all duration-500"
                      style={{
                        height: `${Math.max(
                          20,
                          ((overviewData?.package_tiers?.core_offers_6_to_10lpa || 0) /
                            (overviewData?.placed_students || 1)) *
                            100
                        )}px`,
                      }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">6 - 10 LPA</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-blue-600">
                      {overviewData?.package_tiers?.mass_offers_lt_6lpa}
                    </span>
                    <div
                      className="w-14 bg-blue-500 rounded-t-md transition-all duration-500"
                      style={{
                        height: `${Math.max(
                          10,
                          ((overviewData?.package_tiers?.mass_offers_lt_6lpa || 0) /
                            (overviewData?.placed_students || 1)) *
                            100
                        )}px`,
                      }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">&lt; 6 LPA</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Visual: Clustered Column Chart</span>
                  <span>Data Model: Star Schema</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAMPUS PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Campus Placement Drives & Recruitment Schedule
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage corporate placement schedules, eligibility thresholds, and branch quotas.
                </p>
              </div>

              <button
                onClick={() => setIsDriveModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Placement Drive</span>
              </button>
            </div>

            {/* Drives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drives.map((d) => (
                <div
                  key={d.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-purple-300 hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-base font-extrabold text-slate-900 block leading-tight">
                          {d.company_name}
                        </span>
                        <p className="text-xs text-purple-700 font-semibold">{d.role_title}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        ₹{d.package_lpa} LPA
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Eligible Branches:</span>
                        <span className="font-semibold text-slate-800">{d.eligible_branches}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Minimum Cutoff CGPA:</span>
                        <span className="font-bold text-indigo-700">{d.min_cgpa} CGPA</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Scheduled Date:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          {d.drive_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {d.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {d.registered_count} Eligible Students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SQL ANALYTICAL VIEWS */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  SQL Analytics & Accreditation Views
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Engineered views and SQL aggregation pipelines powering institutional accreditation (NAAC /
                  NIRF) and analytical reports.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                MySQL &amp; SQLite Compliant
              </span>
            </div>

            <div className="space-y-6 mt-6">
              {sqlShowcases.map((query, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{query.title}</h4>
                      <p className="text-xs text-slate-500">{query.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopySQL(query.code, idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                    >
                      {copiedQueryIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-purple-300 font-mono text-xs overflow-x-auto leading-relaxed">
                    {query.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COHORT PLACEMENT ROSTER & ACTIVE OFFER MANAGEMENT */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Cohort Candidate Roster & Offer Management</span>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                    {filteredCandidates.length} Active
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Directly manage student placement records, award company packages, and inspect ML role predictions.
                </p>
              </div>

              {/* Action Buttons & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enroll Student</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search candidate or branch..."
                    className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <select
                  value={rosterStatusFilter}
                  onChange={(e) => setRosterStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Placed">Placed</option>
                  <option value="Unplaced">Seeking Placement</option>
                </select>

                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="ALL">All Branches</option>
                  {branchData.map((b) => (
                    <option key={b.branch} value={b.branch}>
                      {b.branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Technical Skills</th>
                    <th className="py-3 px-4">Status &amp; Company</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">ML Career Fit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((c) => (
                    <tr key={c.id || c.student_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{c.full_name || (c.email ? c.email.split('@')[0] : 'Student')}</p>
                        <p className="text-[11px] text-slate-400">{c.email || 'student@cognicampus.edu'}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{c.branch}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.cgpa}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.skills ? (
                            c.skills.split(',').slice(0, 3).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                              >
                                {skill.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                          {c.skills && c.skills.split(',').length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                              +{c.skills.split(',').length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {c.placement_status === 'Placed' ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-emerald-700 block">Placed</span>
                              <span className="text-[10px] text-slate-500">{c.company_name}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-xs font-semibold text-amber-600">Seeking Placement</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {c.package_lpa ? (
                          <span className="text-xs font-bold text-purple-700">{c.package_lpa} LPA</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {c.predicted_role ? (
                          <div className="flex items-center gap-1 text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="font-semibold text-slate-800">{c.predicted_role}</span>
                            {(c.prediction_confidence || c.readiness_score) && (
                              <span className="text-[10px] text-purple-600 font-bold ml-1">
                                ({c.prediction_confidence || c.readiness_score}%)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenPlacementModal(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Assign Offer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No candidates match the specified filter criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: UPDATE PLACEMENT OFFER */}
      {isPlacementModalOpen && editingCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Award Placement Offer</h3>
                <p className="text-xs text-slate-500">
                  {editingCandidate.full_name} • {editingCandidate.branch} ({editingCandidate.cgpa} CGPA)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlacementModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlacement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Placement Status
                </label>
                <select
                  value={placementForm.placement_status}
                  onChange={(e) =>
                    setPlacementForm({ ...placementForm, placement_status: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Placed">Placed (Offer Released)</option>
                  <option value="Not Placed">Seeking Placement (Unplaced)</option>
                </select>
              </div>

              {placementForm.placement_status === 'Placed' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Hiring Company
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Microsoft, Google, Deloitte"
                      value={placementForm.company_name}
                      onChange={(e) =>
                        setPlacementForm({ ...placementForm, company_name: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Offered CTC Package (LPA)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="100.0"
                      required
                      value={placementForm.package_lpa}
                      onChange={(e) =>
                        setPlacementForm({ ...placementForm, package_lpa: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPlacementModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition shadow-sm cursor-pointer"
                >
                  Save Placement Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW STUDENT */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enroll Student into Cohort</h3>
                <p className="text-xs text-slate-500">
                  Profile will immediately undergo Scikit-Learn career inference.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Rao"
                  value={addStudentForm.full_name}
                  onChange={(e) =>
                    setAddStudentForm({ ...addStudentForm, full_name: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ananya@cognicampus.edu"
                  value={addStudentForm.email}
                  onChange={(e) =>
                    setAddStudentForm({ ...addStudentForm, email: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Branch
                  </label>
                  <select
                    value={addStudentForm.branch}
                    onChange={(e) =>
                      setAddStudentForm({ ...addStudentForm, branch: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics &amp; Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    CGPA (Scale 0-10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={addStudentForm.cgpa}
                    onChange={(e) =>
                      setAddStudentForm({ ...addStudentForm, cgpa: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Technical Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, SQL, Docker, React"
                  value={addStudentForm.skills}
                  onChange={(e) =>
                    setAddStudentForm({ ...addStudentForm, skills: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition shadow-sm cursor-pointer"
                >
                  Enroll &amp; Evaluate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: POST CAMPUS DRIVE */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Post Placement Drive</h3>
                <p className="text-xs text-slate-500">
                  Notify eligible campus students and establish cutoff criteria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon, Google, NVIDIA"
                  value={driveForm.company_name}
                  onChange={(e) =>
                    setDriveForm({ ...driveForm, company_name: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Software Engineer"
                  value={driveForm.role_title}
                  onChange={(e) =>
                    setDriveForm({ ...driveForm, role_title: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    CTC Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1.0"
                    required
                    value={driveForm.package_lpa}
                    onChange={(e) =>
                      setDriveForm({ ...driveForm, package_lpa: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Minimum Cutoff CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={driveForm.min_cgpa}
                    onChange={(e) =>
                      setDriveForm({ ...driveForm, min_cgpa: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Eligible Branches
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science, Information Technology"
                  value={driveForm.eligible_branches}
                  onChange={(e) =>
                    setDriveForm({ ...driveForm, eligible_branches: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Drive Date
                  </label>
                  <input
                    type="date"
                    required
                    value={driveForm.drive_date}
                    onChange={(e) =>
                      setDriveForm({ ...driveForm, drive_date: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Initial Status
                  </label>
                  <select
                    value={driveForm.status}
                    onChange={(e) =>
                      setDriveForm({ ...driveForm, status: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active Registration">Active Registration</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition shadow-sm cursor-pointer"
                >
                  Announce Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
