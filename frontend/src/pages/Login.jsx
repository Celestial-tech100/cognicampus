import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LogIn,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Building2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Validation & status state
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [demoLoadingRole, setDemoLoadingRole] = useState('')

  // Success message if routed from registration
  const registrationSuccessMessage = location.state?.registrationSuccess

  const validate = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@college.edu).'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (apiError) {
      setApiError('')
    }
  }

  const performLogin = async (email, password) => {
    setApiError('')
    const result = await login({ email, password })

    const from = location.state?.from?.pathname
    const isSafeFrom = from && !from.includes('/login') && !from.includes('/unauthorized')

    if (result.role === 'student') {
      navigate(isSafeFrom ? from : '/student/dashboard', { replace: true })
    } else if (result.role === 'recruiter') {
      navigate(isSafeFrom ? from : '/recruiter/dashboard', { replace: true })
    } else if (result.role === 'admin') {
      navigate(isSafeFrom ? from : '/admin/dashboard', { replace: true })
    } else {
      setApiError('Authenticated role is unrecognized or unsupported. Access restricted.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await performLogin(formData.email, formData.password)
    } catch (err) {
      setApiError(err.message || 'Login failed. Please verify your credentials.')
      if (err.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1-Click Viva & Evaluator Demo Logins
  const handleDemoLogin = async (roleName, email, password) => {
    setDemoLoadingRole(roleName)
    setFormData({ email, password })
    try {
      await performLogin(email, password)
    } catch (err) {
      setApiError(`Demo login failed for ${roleName}: ` + (err.message || 'Unknown error'))
    } finally {
      setDemoLoadingRole('')
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500">
          Sign in to access your CogniCampus dashboard and intelligence tools.
        </p>
      </div>

      {/* 1-Click Viva & Evaluator Demo Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border border-indigo-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>1-Click Viva &amp; Demo Logins</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
            Fast Access
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-snug">
          Click any role below to sign in instantly with seeded academic and analytics data:
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoLogin('student', 'student@cognicampus.edu', 'password123')}
            disabled={isSubmitting || Boolean(demoLoadingRole)}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 transition-all shadow-2xs group cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 mb-1 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900">Student</span>
            <span className="text-[10px] text-slate-400">ML Predictions</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('recruiter', 'recruiter@cognicampus.edu', 'password123')}
            disabled={isSubmitting || Boolean(demoLoadingRole)}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 transition-all shadow-2xs group cursor-pointer"
          >
            <Building2 className="w-4 h-4 mb-1 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900">Recruiter</span>
            <span className="text-[10px] text-slate-400">Talent Pipeline</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin', 'admin@cognicampus.edu', 'password123')}
            disabled={isSubmitting || Boolean(demoLoadingRole)}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-all shadow-2xs group cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 mb-1 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900">Admin</span>
            <span className="text-[10px] text-slate-400">Power BI &amp; SQL</span>
          </button>
        </div>

        {demoLoadingRole && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-700 pt-1">
            <LoadingSpinner size="sm" message="" />
            <span>Signing in as {demoLoadingRole}...</span>
          </div>
        )}
      </div>

      {/* Registration success alert banner if applicable */}
      {registrationSuccessMessage && (
        <div
          role="status"
          className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p>{registrationSuccessMessage}</p>
        </div>
      )}

      {/* API Error Alert */}
      {apiError && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Authentication Failed</p>
            <p className="text-xs text-rose-700 mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="e.g. yourname@college.edu"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isSubmitting || Boolean(demoLoadingRole)}
          autoComplete="email"
          required
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isSubmitting || Boolean(demoLoadingRole)}
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting || Boolean(demoLoadingRole)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" message="" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Link to Registration */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none focus:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
