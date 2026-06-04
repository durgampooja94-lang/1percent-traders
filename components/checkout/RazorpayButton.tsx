'use client'
// components/checkout/RazorpayButton.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import Button from '@/components/ui/Button'
import { ShieldCheck, CreditCard } from 'lucide-react'

declare global {
  interface Window { Razorpay: any }
}

interface RazorpayButtonProps {
  amount: number
  courseIds: string[]
  couponCode?: string
}

export default function RazorpayButton({ amount, courseIds, couponCode }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const { user, getToken } = useAuth()
  const { clearCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handlePayment = async () => {
    if (!user) { router.push('/login?redirect=/cart'); return }
    setLoading(true)
    try {
      const token = await getToken()

      // 100% coupon — skip Razorpay, enroll for free
      if (amount === 0 && couponCode) {
        const freeRes = await fetch('/api/razorpay/free-enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseIds, couponCode }),
        })
        if (freeRes.ok) {
          clearCart()
          router.push('/payment')
        } else {
          const err = await freeRes.json()
          alert('Enrollment error: ' + (err.error || 'Please try again.'))
          setLoading(false)
        }
        return
      }

      // Create Razorpay order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, courseIds, couponCode }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok || !orderData.orderId) {
        console.error('Create order failed:', orderData)
        alert('Payment error: ' + (orderData.error || 'Could not create order. Please try again.'))
        setLoading(false)
        return
      }
      const { orderId, amount: orderAmount, currency } = orderData

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency,
        name: '1% Traders',
        description: `${courseIds.length} Course${courseIds.length > 1 ? 's' : ''}`,
        order_id: orderId,
        prefill: {
          name: user.name,
          contact: user.phone,
          email: user.email || '',
        },
        theme: { color: '#0EA5E9' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              courseIds,
              amount,
            }),
          })
          if (verifyRes.ok) {
            clearCart()
            router.push('/payment')
          } else {
            router.push('/payment/failed')
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="gold"
        size="lg"
        fullWidth
        onClick={handlePayment}
        loading={loading || !scriptLoaded}
        className="text-dark-900 font-bold"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        {amount === 0 ? 'Enroll for Free' : `Pay ₹${amount.toLocaleString()}`}
      </Button>
      <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Secured by Razorpay · 100% safe & encrypted</span>
      </div>
    </div>
  )
}
