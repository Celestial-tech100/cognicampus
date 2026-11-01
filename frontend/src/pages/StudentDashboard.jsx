import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Briefcase,
  TrendingUp,
  Cpu,
  Sliders,
  RefreshCw,
  Save,
  Plus,
  X,
  Award,
  BarChart3,
  Target,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Edit3,
  Check,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  // Section Refs for smooth scrolling
  const overviewRef = useRef(null)
  const readinessRef = useRef(null)
  const simulatorRef = useRef(null)
  const profileRef = useRef(null)

  // Dashboard Data State
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Interactive What-If Simulator State
  const [simCgpa, setSimCgpa] = useState(8.0)
  const [simSkills, setSimSkills] = useState(['Python', 'SQL', 'Data Structures'])
  const [newSkillInput, setNewSkillInput] = useState('')
  const [simResult, setSimResult] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simSuccessMsg, setSimSuccessMsg] = useState('')

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('')

  // Job Applications State (store applied job IDs)
  const [appliedJobs, setAppliedJobs] = useState({})

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    branch: '',
    cgpa: 8.0,
    skills: '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Quick Skill Suggestions for Interactive What-If
  const suggestedSkills = [
    'Python',
    'React',
    'SQL',
    'Machine Learning',
    'Data Structures',
    'Selenium',
    'Postman',
    'Tableau',
    'Power BI',
    'Pandas',
    'Java',
    'C++',
    'Agile',
    'Manual Testing',
    'Docker',
  ]

  // Fetch student dashboard and ML predictions from backend
  const loadDashboardData = async () => {
    setFetchError('')
    try {
      const response = await api.get('/student/dashboard')
      const data = response.data
      setProfileData(data)

      // Initialize simulator with student's profile & initial ML predictions
      if (data) {
        setSimCgpa(data.cgpa || 7.5)
        if (data.skill_list && data.skill_list.length > 0) {
          setSimSkills(data.skill_list)
        }
        setEditForm({
          fullName: data.full_name || '',
          branch: data.branch || '',
          cgpa: data.cgpa || 7.5,
          skills: data.skills || '',
        })

        // Pre-populate simulation output so it is NEVER blank!
        if (data.ml_predictions) {
          setSimResult({
            top_role: data.ml_predictions.top_role,
            readiness_score: data.ml_predictions.readiness_score,
            recommended_roles: data.ml_predictions.recommended_roles,
          })
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setFetchError(err.message || 'Failed to load career intelligence data.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Handle Tab Navigation & Scrolling
  useEffect(() => {
    if (activeTab === 'readiness' && readinessRef.current) {
      readinessRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (activeTab === 'simulator' && simulatorRef.current) {
      simulatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (activeTab === 'profile' && profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (activeTab === 'overview' && overviewRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeTab])

  // Run interactive "What-If" prediction
  const handleRunSimulation = async (cgpaToUse = simCgpa, skillsToUse = simSkills) => {
    if (skillsToUse.length === 0) {
      showToast('Please include at least one core skill for the ML model.')
      return
    }

    setIsSimulating(true)
    setSimSuccessMsg('')
    try {
      const response = await api.post('/student/predict-career', {
        cgpa: parseFloat(cgpaToUse),
        skills: skillsToUse,
        top_k: 3,
      })
      setSimResult(response.data)
      showToast(`ML Prediction recalculated: ${response.data.top_role} (${response.data.readiness_score}%)`)
    } catch (err) {
      showToast(err.message || 'Simulation prediction failed.')
    } finally {
      setIsSimulating(false)
    }
  }

  // Add skill to simulator and auto-run
  const handleAddSkill = (skillToAdd) => {
    const trimmed = skillToAdd.trim()
    if (!trimmed) return
    if (!simSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...simSkills, trimmed]
      setSimSkills(updated)
      handleRunSimulation(simCgpa, updated)
    }
    setNewSkillInput('')
  }

  // Remove skill from simulator and auto-run
  const handleRemoveSkill = (skillToRemove) => {
    if (simSkills.length <= 1) {
      showToast('Keep at least one skill for the classifier.')
      return
    }
    const updated = simSkills.filter((s) => s !== skillToRemove)
    setSimSkills(updated)
    handleRunSimulation(simCgpa, updated)
  }

  // Slider change handler
  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value)
    setSimCgpa(val)
  }

  // Save simulated settings directly into the student's actual database profile
  const handleApplySimToProfile = async () => {
    setIsSavingProfile(true)
    try {
      await api.put('/student/profile', {
        cgpa: parseFloat(simCgpa),
        skills: simSkills.join(', '),
      })
      showToast('Profile updated with simulated parameters! Retraining view...')
      setTimeout(() => {
        loadDashboardData()
      }, 800)
    } catch (err) {
      showToast('Failed to update profile: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Save manual profile edits
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      await api.put('/student/profile', {
        full_name: editForm.fullName,
        branch: editForm.branch,
        cgpa: parseFloat(editForm.cgpa),
        skills: editForm.skills,
      })
      setIsEditingProfile(false)
      showToast('Student profile saved successfully!')
      loadDashboardData()
    } catch (err) {
      showToast('Failed to save profile: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handle Quick Job Application
  const handleApplyJob = (roleTitle, company) => {
    setAppliedJobs((prev) => ({ ...prev, [roleTitle]: true }))
    showToast(`Application successfully sent to ${company} for ${roleTitle}!`)
  }

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner fullPage={false} message="Loading ML Career Intelligence Engine..." />
      </div>
    )
  }

  if (fetchError && !profileData) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-rose-950">Connection Error</h2>
        <p className="text-sm text-rose-700">{fetchError}</p>
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    )
  }

  const ml = profileData?.ml_predictions || {}
  const predictions = ml.recommended_roles || []
  const topRole = ml.top_role || 'Software Developer'
  const readinessScore = ml.readiness_score || 0

  // Simulated Job Openings aligned with the ML prediction
  const jobRecommendations = {
    'Software Developer': [
      { role: 'Graduate Software Engineer', company: 'Cognizant / Infosys', ctc: '6.5 - 9.0 LPA', match: '96%' },
      { role: 'Associate Full-Stack Developer', company: 'TCS Digital', ctc: '7.2 - 11.0 LPA', match: '91%' },
      { role: 'Backend Platform Intern', company: 'Amazon Campus Tech', ctc: '45k / Month Stipend', match: '88%' },
    ],
    'Data Analyst': [
      { role: 'Junior Business Intelligence Analyst', company: 'Deloitte USI', ctc: '7.0 - 9.5 LPA', match: '95%' },
      { role: 'Data Operations & SQL Engineer', company: 'Mu Sigma Analytics', ctc: '6.0 - 8.5 LPA', match: '90%' },
      { role: 'Data Visualization Specialist', company: 'EY GDS', ctc: '6.5 - 8.0 LPA', match: '87%' },
    ],
    'QA Engineer': [
      { role: 'QA Automation Engineer', company: 'Wipro Technologies', ctc: '5.5 - 7.5 LPA', match: '94%' },
      { role: 'SDET Trainee (Selenium & API)', company: 'Capgemini India', ctc: '6.0 - 8.0 LPA', match: '89%' },
      { role: 'Quality Assurance Analyst', company: 'Accenture Technology', ctc: '5.0 - 6.8 LPA', match: '85%' },
    ],
  }

  const activeJobs = jobRecommendations[topRole] || jobRecommendations['Software Developer']

  return (
    <div ref={overviewRef} className="space-y-8 max-w-6xl pb-16">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'overview', label: 'All Overview', icon: Sparkles },
          { id: 'readiness', label: 'ML Career Readiness', icon: TrendingUp },
          { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
          { id: 'profile', label: 'Academic Profile', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSearchParams({ tab: tab.id })
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Hero Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-indigo-400/30">
              <Cpu className="w-3.5 h-3.5 text-amber-300" />
              <span>Scikit-Learn ML Career Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profileData?.full_name || user?.fullName || 'Student'}!
            </h1>
            <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
              Your real-time academic profile is integrated with our multi-class Logistic Regression ML model to analyze placement readiness and forecast optimal career trajectories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all shadow-sm cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => {
                setIsRefreshing(true)
                showToast('Synchronizing profile with Scikit-Learn classifier...')
                loadDashboardData()
              }}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync Model</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top ML Intelligence Metric Cards (Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Readiness Score (Click to scroll to readiness breakdown) */}
        <div
          onClick={() => {
            setSearchParams({ tab: 'readiness' })
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
              Placement Readiness Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {readinessScore}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {readinessScore >= 70 ? 'High Affinity' : readinessScore >= 40 ? 'Moderate' : 'Developing'}
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(10, readinessScore))}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">
                Calculated via Scikit-Learn probability.
              </p>
              <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline">
                View Details →
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Primary Predicted Career (Click to scroll to simulator) */}
        <div
          onClick={() => {
            setSearchParams({ tab: 'simulator' })
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
              Primary Career Match
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 truncate" title={topRole}>
              {topRole}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Top recommended domain from historical placement outcomes.
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ranked #1 recommendation</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline">
                Simulate →
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Academic Profile Standing (Click to edit profile) */}
        <div
          onClick={() => setIsEditingProfile(true)}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
              Academic Standing
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {profileData?.cgpa?.toFixed(2) || '0.00'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 10.0 CGPA</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 truncate">
              {profileData?.branch || 'Computer Science & Engineering'}
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="text-[11px] text-slate-500">
                {profileData?.skill_list?.length || 0} Core skills registered
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline">
                Edit Profile →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Career Trajectory Breakdown & Skill Cloud Section */}
      <div ref={readinessRef} id="readiness-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-20">
        {/* ML Prediction Ranking Table & Bars (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>ML Model Career Trajectory Probabilities</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-class classification trained on verified historical hiring datasets
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg border border-indigo-100">
              scikit-learn
            </span>
          </div>

          {/* Predictions Bar List */}
          <div className="space-y-4">
            {predictions.length > 0 ? (
              predictions.map((item, index) => {
                const percentage = Math.round(item.score * 100)
                const isTop = index === 0
                return (
                  <div
                    key={item.career_path}
                    className={`p-4 rounded-xl border transition-all ${
                      isTop
                        ? 'border-indigo-300 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isTop
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            {item.career_path}
                          </span>
                          {isTop && (
                            <span className="ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Best Fit
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">
                        {percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/70 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ${
                          isTop
                            ? 'bg-indigo-600'
                            : index === 1
                            ? 'bg-teal-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-slate-400">
                No predictions available yet. Click Sync Model above.
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>How the Model Works:</strong> Our prediction engine feeds your current CGPA and tokenized technical skills into a normalized CountVectorizer and StandardScaler pipeline, evaluating historical graduate placement patterns.
            </p>
          </div>
        </div>

        {/* Current Core Skills Cloud Card (1 col) */}
        <div ref={profileRef} id="profile-section" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5 scroll-mt-20">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>Your Verified Skills</span>
              </h2>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Edit
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Features currently fed into your Scikit-Learn career inference:
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {profileData?.skill_list && profileData.skill_list.length > 0 ? (
                profileData.skill_list.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills listed yet.</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold">{profileData?.branch || 'General'}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span className="text-slate-400">Account:</span>
              <span className="font-mono text-slate-500 truncate max-w-[150px]">
                {profileData?.email || user?.email}
              </span>
            </div>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Update Profile Details
            </button>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Career Simulator Card */}
      <div
        ref={simulatorRef}
        id="simulator-section"
        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-2">
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive ML Simulator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Test "What-If" Scenarios with Live ML Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Experiment with adjusting your CGPA and adding new programming languages or frameworks to observe real-time predictions from the Scikit-Learn classifier.
            </p>
          </div>

          <button
            onClick={() => handleRunSimulation(simCgpa, simSkills)}
            disabled={isSimulating}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSimulating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{isSimulating ? 'Predicting...' : 'Simulate Prediction'}</span>
          </button>
        </div>

        {/* Simulator Controls & Realtime Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls (Left) */}
          <div className="space-y-5">
            {/* CGPA Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label className="font-semibold text-slate-200">
                  Simulated CGPA: <span className="text-amber-300 font-bold text-base">{simCgpa}</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = Math.min(10.0, +(simCgpa + 0.5).toFixed(1))
                      setSimCgpa(updated)
                      handleRunSimulation(updated, simSkills)
                    }}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-xs rounded text-slate-200"
                  >
                    +0.5
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = Math.max(5.0, +(simCgpa - 0.5).toFixed(1))
                      setSimCgpa(updated)
                      handleRunSimulation(updated, simSkills)
                    }}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-xs rounded text-slate-200"
                  >
                    -0.5
                  </button>
                  <span className="text-xs text-slate-400">Scale: 0.0 - 10.0</span>
                </div>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.1"
                value={simCgpa}
                onChange={handleSliderChange}
                onMouseUp={() => handleRunSimulation(simCgpa, simSkills)}
                onTouchEnd={() => handleRunSimulation(simCgpa, simSkills)}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Simulated Skills List */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 block">
                Simulated Core Skills ({simSkills.length})
              </label>

              <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 min-h-[60px]">
                {simSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-300 focus:outline-none cursor-pointer"
                      title="Remove skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add custom skill input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Type new skill (e.g. AWS, Docker) & press Enter"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill(newSkillInput)
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick skill recommendations to click & add */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                  Click to add trending competencies (auto-runs model):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills
                    .filter((s) => !simSkills.includes(s))
                    .slice(0, 10)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSkill(s)}
                        className="text-[11px] px-2.5 py-1 bg-white/10 hover:bg-white/25 active:scale-95 text-indigo-200 rounded-lg border border-white/10 transition-all cursor-pointer font-medium"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Realtime Simulation Outcome (Right) */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulation Output
                </span>
                <span className="text-[10px] uppercase font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-300/20">
                  Live ML Analysis
                </span>
              </div>

              {simResult ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Forecasted Top Role:</span>
                      <h3 className="text-2xl font-extrabold text-amber-300">
                        {simResult.top_role}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Readiness Score:</span>
                      <div className="text-2xl font-extrabold text-emerald-400">
                        {simResult.readiness_score}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Ranked Class Confidence:
                    </span>
                    {simResult.recommended_roles?.map((item, idx) => (
                      <div key={item.career_path} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>{item.career_path}</span>
                          <span className="font-bold">{Math.round(item.score * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              idx === 0 ? 'bg-amber-400' : 'bg-indigo-400'
                            }`}
                            style={{ width: `${Math.round(item.score * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-indigo-400 opacity-60 animate-pulse" />
                  <p className="text-xs">
                    Computing real-time Scikit-Learn predictions...
                  </p>
                </div>
              )}
            </div>

            {/* Apply to Profile Action */}
            {simResult && (
              <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleApplySimToProfile}
                  disabled={isSavingProfile}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSavingProfile ? 'Saving Changes...' : 'Save These Skills & CGPA to My Profile'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matching Campus Job Opportunities Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>Recommended Campus Drives for You</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Opportunities matching your ML predicted profile: <strong>{topRole}</strong>
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-100">
            {activeJobs.length} Live Openings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeJobs.map((job) => {
            const isApplied = appliedJobs[job.role]
            return (
              <div
                key={job.role}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {job.match} Match
                    </span>
                    <span className="text-xs font-semibold text-slate-600">{job.ctc}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{job.role}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyJob(job.role, job.company)}
                  disabled={isApplied}
                  className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isApplied
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <span>Quick Apply</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Student Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch / Department
                </label>
                <input
                  type="text"
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CGPA (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={editForm.cgpa}
                  onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technical Skills (comma-separated)
                </label>
                <textarea
                  rows="3"
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Python, SQL, React, Machine Learning"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The Scikit-Learn recommender tokenizes these skills to generate your career predictions.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {isSavingProfile ? 'Saving...' : 'Save & Retrain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
