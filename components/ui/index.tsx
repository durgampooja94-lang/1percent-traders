'use client'
// components/ui/Badge.tsx
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'orange' | 'gold' | 'green' | 'red' | 'blue' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'orange', className }: BadgeProps) {
  const variants = {
    orange: 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
    gold:   'bg-gold-500/20 text-gold-400 border border-gold-500/30',
    green:  'bg-green-500/20 text-green-400 border border-green-500/30',
    red:    'bg-red-500/20 text-red-400 border border-red-500/30',
    blue:   'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    gray:   'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
}

export function Input({ label, error, prefix, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>
        )}
        <input
          {...props}
          className={clsx(
            'w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors',
            prefix && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export function Card({ children, className, hover, glow }: CardProps) {
  return (
    <div className={clsx(
      'bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden',
      hover && 'hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer',
      glow && 'hover:shadow-xl hover:shadow-brand-500/10',
      className
    )}>
      {children}
    </div>
  )
}

// components/ui/Spinner.tsx
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <svg className={clsx('animate-spin text-brand-500', sizes[size])} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-800 border border-dark-400 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-dark-500">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
