'use client'
import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Navbar from '@/components/layout/Navbar'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import RazorpayButton from '@/components/checkout/RazorpayButton'
import { Trash2, ShoppingBag, Tag, ArrowRight, Shield, Mail } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeFromCart, total } = useCart()
  const { user } = useAuth()
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')

  const [email, setEmail] = useState(user?.email || '')
  const [emailSaved, setEmailSaved] = useState(!!user?.email)
  const [emailError, setEmailError] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  const applyCoupon = () => {
    if (!coupon.trim()) return
    const code = coupon.toUpperCase()
    if (code === 'TRADER10') {
      setDiscount(Math.round(total * 0.1))
      setCouponApplied(true)
      setCouponError('')
    } else if (code === 'FOREX60') {
      setDiscount(Math.round(total * 0.6))
      setCouponApplied(true)
      setCouponError('')
    } else {
      setCouponError('Invalid or expired coupon code')
    }
  }

  const saveEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Please enter a valid email address')
      return
    }
    setSavingEmail(true)
    try {
      await setDoc(doc(db, 'users', user!.uid), { email: email.trim() }, { merge: true })
      setEmailSaved(true)
      setEmailError('')
    } catch (e) {
      setEmailError('Failed to save email. Please try again.')
    } finally {
      setSavingEmail(false)
    }
  }

  const finalAmount = total - discount

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-3xl bg-dark-700 border border-dark-500 flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-white font-bold text-2xl mb-2">Your cart is empty</h2>
          <p className="text-gray-400 text-sm mb-8">Add some courses to get started</p>
          <Link href="/#courses"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Browse Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-black text-white mb-8">
          Your Cart ({items.length} course{items.length > 1 ? 's' : ''})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ course }) => (
              <div key={course.id} className="bg-dark-800 border border-dark-500 rounded-2xl p-5 flex gap-4">
                <div className="w-24 h-16 bg-dark-700 rounded-xl overflow-hidden flex-shrink-0">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-900/50 to-dark-600 flex items-center justify-center">
                      <span className="text-brand-400 text-xs font-bold">1%</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{course.title}</h3>
                  <p className="text-gray-500 text-xs">{course.totalVideos} videos · {course.level}</p>
                </div>
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <div className="text-right">
                    <div className="text-white font-bold">₹{course.price.toLocaleString()}</div>
                    {course.originalPrice && (
                      <div className="text-gray-600 text-xs line-through">₹{course.originalPrice.toLocaleString()}</div>
                    )}
                  </div>
                  <button onClick={() => removeFromCart(course.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />Promo Code
                </label>
                {couponApplied ? (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2.5">
                    <span className="text-green-400 text-sm font-medium">✓ {coupon.toUpperCase()} applied</span>
                    <button onClick={() => { setCouponApplied(false); setDiscount(0); setCoupon('') }}
                      className="text-gray-500 hover:text-red-400 text-xs ml-auto">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={coupon} onChange={e => setCoupon(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 bg-dark-700 border border-dark-400 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors" />
                    <button onClick={applyCoupon}
                      className="bg-dark-600 border border-dark-400 text-white text-sm px-4 rounded-xl hover:border-brand-500/50 transition-colors font-medium">
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
              </div>

              {/* Totals */}
              <div className="space-y-3 pb-5 border-b border-dark-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">₹{total.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">GST (18%)</span>
                  <span className="text-white">Included</span>
                </div>
              </div>

              <div className="flex justify-between py-4 mb-5">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-black text-xl">₹{finalAmount.toLocaleString()}</span>
              </div>

              {user ? (
                <>
                  {/* Email collection */}
                  {!emailSaved ? (
                    <div className="mb-4 space-y-2">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                        <Mail className="w-3.5 h-3.5" /> Email for receipt
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setEmailError('') }}
                          placeholder="your@email.com"
                          className="flex-1 bg-dark-700 border border-dark-400 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                        />
                        <button
                          onClick={saveEmail}
                          disabled={savingEmail}
                          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 rounded-xl transition-colors disabled:opacity-50">
                          {savingEmail ? '…' : 'Save'}
                        </button>
                      </div>
                      {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
                      <p className="text-gray-500 text-xs">Required to receive your payment receipt</p>
                    </div>
                  ) : (
                    <div className="mb-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
                      <Mail className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400 text-sm">{email || user.email}</span>
                      <button onClick={() => setEmailSaved(false)}
                        className="text-gray-500 hover:text-gray-300 text-xs ml-auto">Change</button>
                    </div>
                  )}

                  {emailSaved && (
                    <RazorpayButton
                      amount={finalAmount}
                      courseIds={items.map(i => i.course.id)}
                      couponCode={couponApplied ? coupon : undefined}
                    />
                  )}
                </>
              ) : (
                <Link href="/login?redirect=/cart"
                  className="block text-center bg-brand-gradient text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity">
                  Login to Checkout
                </Link>
              )}
            </div>

            <div className="flex items-start gap-3 bg-dark-800/50 border border-dark-600 rounded-xl p-4">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Secure & Safe</p>
                <p className="text-gray-500 text-xs mt-0.5">PCI-DSS compliant · 256-bit SSL encryption · Razorpay secured</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
