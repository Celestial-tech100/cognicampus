import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function FormInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  autoComplete,
  helperText,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const computedType = isPassword ? (showPassword ? 'text' : 'password') : type

  const errorId = error ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      </div>

      <div className="relative rounded-lg shadow-sm">
        <input
          id={id}
          name={name || id}
          type={computedType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${
            isPassword ? 'pr-11' : ''
          } ${
            error
              ? 'border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-indigo-100 hover:border-slate-400'
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-indigo-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {helperText && !error && (
        <p id={helperId} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-rose-600 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  )
}
