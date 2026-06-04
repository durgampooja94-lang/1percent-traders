export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { courseIds, couponCode } = await req.json()
    if (!courseIds?.length) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const validFreeCoupons = ['FOREX100']
    if (!validFreeCoupons.includes(couponCode?.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid coupon for free enrollment' }, { status: 400 })
    }

    const userDoc = await getAdminDb().collection('users').doc(decoded.uid).get()
    const userData = userDoc.data() || {}

    const db = getAdminDb()
    const batch = db.batch()
    const now = FieldValue.serverTimestamp()

    const orderRef = db.collection('orders').doc()
    batch.set(orderRef, {
      userId: decoded.uid,
      userName: userData.name || '',
      userPhone: userData.phone || '',
      userEmail: userData.email || '',
      courseIds,
      amount: 0,
      couponCode: couponCode.toUpperCase(),
      status: 'paid',
      createdAt: now,
    })

    for (const courseId of courseIds) {
      const purchaseRef = db.collection('users').doc(decoded.uid).collection('purchases').doc(courseId)
      batch.set(purchaseRef, {
        courseId,
        orderId: orderRef.id,
        purchasedAt: now,
        amount: 0,
        couponCode: couponCode.toUpperCase(),
      })

      const courseRef = db.collection('courses').doc(courseId)
      batch.update(courseRef, { enrolledCount: FieldValue.increment(1) })
    }

    await batch.commit()

    return NextResponse.json({ success: true, orderId: orderRef.id })
  } catch (error) {
    console.error('Free enroll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
