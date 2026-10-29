import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  fullPage = false,
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 p-4"
    >
      <Loader2
        className={`${sizeMap[size] || sizeMap.md} animate-spin text-indigo-600`}
        aria-hidden="true"
      />
      {message && (
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          {message}
        </p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
