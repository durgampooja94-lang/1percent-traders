'use client'
// app/(auth)/payment/page.tsx
import Link from 'next/link'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import { useEffect } from 'react'

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Trigger confetti or celebration animation
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then(m => {
        m.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      }).catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6 animate-fade-up">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-white font-black text-3xl mb-3 animate-fade-up delay-100">
          Payment Successful! 🎉
        </h1>
        <p className="text-gray-400 text-base mb-8 animate-fade-up delay-200">
          Welcome to 1% Traders! Your course access has been activated. Start learning right away.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up delay-300">
          <Link href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Go to My Courses <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/"
            className="inline-flex items-center justify-center gap-2 bg-dark-700 border border-dark-500 text-gray-300 font-medium px-6 py-3 rounded-xl hover:text-white hover:border-brand-500/40 transition-all">
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  )
}
