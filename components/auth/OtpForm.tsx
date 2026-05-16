'use client'
// components/auth/OtpForm.tsx
import { useState, useRef, useEffect } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { Phone, Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function OtpForm({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    if ((window as any).recaptchaVerifier) return
    const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    })
    ;(window as any).recaptchaVerifier = recaptcha
    return () => {
      recaptcha.clear()
      delete (window as any).recaptchaVerifier
    }
  }, [])

  const sendOtp = async () => {
    setError('')
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    if (formattedPhone.replace('+91', '').length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    try {
      const recaptcha = (window as any).recaptchaVerifier
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptcha)
      setConfirmation(result)
      setStep('otp')
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!confirmation) return
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit OTP'); return }
    setLoading(true)
    setError('')
    try {
      const result = await confirmation.confirm(code)
      const uid = result.user.uid

      const token = await result.user.getIdToken()
      document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`

      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        setIsNewUser(true)
        setStep('name')
      } else {
        router.push(redirectTo)
      }
    } catch {
      setError('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveName = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) return
      const token = await user.getIdToken()
      document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        phone: user.phoneNumber,
        name: name.trim(),
        role: 'user',
        createdAt: serverTimestamp(),
      })
      router.push(redirectTo)
    } catch {
      setError('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="recaptcha-container" />

      {/* Step: Phone */}
      {step === 'phone' && (
        <div className="space-y-6 animate-fade-up">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Enter your phone</h2>
            <p className="text-gray-400 text-sm">We'll send you a one-time password</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <div className="flex gap-2">
              <div className="bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-gray-300 text-sm font-medium shrink-0">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder="9876543210"
                className="flex-1 bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-lg tracking-widest"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button variant="primary" size="lg" fullWidth onClick={sendOtp} loading={loading}>
            Send OTP <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-gray-500 text-xs text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      )}

      {/* Step: OTP */}
      {step === 'otp' && (
        <div className="space-y-6 animate-fade-up">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Verify OTP</h2>
            <p className="text-gray-400 text-sm">Enter the 6-digit code sent to +91 {phone}</p>
          </div>

          <div className="flex gap-2 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-bold text-white bg-dark-700 border-2 border-dark-400 rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
                maxLength={1}
              />
            ))}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button variant="primary" size="lg" fullWidth onClick={verifyOtp} loading={loading}>
            Verify OTP
          </Button>

          <button onClick={() => setStep('phone')} className="w-full text-gray-400 hover:text-white text-sm transition-colors">
            ← Change phone number
          </button>
        </div>
      )}

      {/* Step: Name (new user) */}
      {step === 'name' && (
        <div className="space-y-6 animate-fade-up">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Welcome!</h2>
            <p className="text-gray-400 text-sm">Just one more step — tell us your name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              placeholder="Enter your full name"
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button variant="primary" size="lg" fullWidth onClick={saveName} loading={loading}>
            Complete Setup <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
