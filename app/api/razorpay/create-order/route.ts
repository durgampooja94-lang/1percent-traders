// app/api/razorpay/create-order/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrder } from '@/lib/razorpay'
import { verifyToken } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { amount, courseIds } = await req.json()

    if (!amount || !courseIds?.length) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const receipt = `ord_${decoded.uid.slice(0, 14)}_${Date.now().toString().slice(-8)}`
    const order = await createRazorpayOrder(amount, receipt)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error('Create order error:', error?.error || error?.message || error)
    return NextResponse.json({ error: error?.error?.description || error?.message || 'Internal server error' }, { status: 500 })
  }
}
