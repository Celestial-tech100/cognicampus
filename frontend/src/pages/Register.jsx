import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, AlertCircle, GraduationCap, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // default selection
  })

  // Validation & status state
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    // Role boundary validation: Public portal permits ONLY Student or Recruiter
    if (!['student', 'recruiter'].includes(formData.role)) {
      newErrors.role = 'Please select a valid account role (Student or Recruiter).'
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

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }))
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })

      // On success, redirect to login page with friendly confirmation message
      navigate('/login', {
        state: {
          registrationSuccess: `Account created successfully for ${formData.fullName}! Please sign in with your credentials.`,
        },
      })
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please check your information.')
      if (err.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create an Account
        </h1>
        <p className="text-sm text-slate-500">
          Join CogniCampus to discover placement opportunities and career intelligence.
        </p>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Registration Failed</p>
            <p className="text-xs text-rose-700 mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Role Selector Cards */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Select Your Role <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                formData.role === 'student'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
              }`}
            >
              <GraduationCap className="w-5 h-5 mb-1 text-indigo-600" />
              <span className="text-sm">Student</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Looking for placements</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('recruiter')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                formData.role === 'recruiter'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
              }`}
            >
              <Building2 className="w-5 h-5 mb-1 text-indigo-600" />
              <span className="text-sm">Recruiter</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Hiring campus talent</span>
            </button>
          </div>
          {errors.role && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {errors.role}
            </p>
          )}
        </div>

        <FormInput
          id="fullName"
          name="fullName"
          label="Full Name"
          placeholder="e.g. Jane Doe"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          disabled={isSubmitting}
          autoComplete="name"
          required
        />

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="e.g. jane@college.edu"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isSubmitting}
          autoComplete="email"
          required
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a secure password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          helperText="Minimum 6 characters"
          disabled={isSubmitting}
          autoComplete="new-password"
          required
        />

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" message="" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Link to Login */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none focus:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
