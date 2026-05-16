'use client'
// components/ui/Button.tsx
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  loading,
  type = 'button',
  className,
  fullWidth,
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-brand-gradient text-white hover:opacity-90 active:scale-95 shadow-lg shadow-brand-500/25',
    secondary: 'bg-dark-600 text-white border border-dark-400 hover:bg-dark-500 active:scale-95',
    ghost: 'text-gray-300 hover:text-white hover:bg-dark-600 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    gold: 'bg-brand-gradient text-white hover:opacity-90 active:scale-95 font-bold shadow-lg shadow-brand-500/25',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  )
}
