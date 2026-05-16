'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

function LoginLogo() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-xl shadow-brand-500/30">
        <span className="text-white font-black text-2xl">1%</span>
      </div>
    )
  }
  return (
    <img src="/logo.JPG" alt="1%" className="w-16 h-16 object-contain rounded-2xl"
      onError={() => setErr(true)} />
  )
}

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithGoogle, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const redirectTo = searchParams.redirect || '/dashboard'

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo)
    }
  }, [user, authLoading])

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      // signInWithRedirect navigates away — nothing to do here
    } catch (e: any) {
      setError(e?.code || e?.message || 'Sign-in failed')
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-brand-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <LoginLogo />
            <span className="text-white font-black text-2xl leading-none">1% Traders Hub</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-500 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-white font-black text-2xl text-center mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm text-center mb-8">Sign in to access your courses</p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-2xl transition-all disabled:opacity-60 shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

          <p className="text-gray-600 text-xs text-center mt-6 leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-brand-400 hover:text-brand-300">Terms</Link>
            {' & '}
            <Link href="/privacy" className="text-brand-400 hover:text-brand-300">Privacy Policy</Link>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          <Link href="/" className="hover:text-gray-400 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
