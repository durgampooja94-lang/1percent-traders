import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { verifyToken, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, courseIds, amount } = await req.json()

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Fetch user name/email for order record
    const userDoc = await getAdminDb().collection('users').doc(decoded.uid).get()
    const userData = userDoc.data() || {}

    const batch = getAdminDb().batch()
    const now = FieldValue.serverTimestamp()

    // Save order
    const orderRef = getAdminDb().collection('orders').doc()
    batch.set(orderRef, {
      userId: decoded.uid,
      userName: userData.name || '',
      userPhone: userData.phone || '',
      userEmail: userData.email || '',
      courseIds,
      amount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'paid',
      createdAt: now,
    })

    // Unlock each purchased course for the user + increment enrolledCount
    for (const courseId of courseIds) {
      const purchaseRef = getAdminDb()
        .collection('users')
        .doc(decoded.uid)
        .collection('purchases')
        .doc(courseId)
      batch.set(purchaseRef, {
        courseId,
        orderId: orderRef.id,
        purchasedAt: now,
        amount,
      })

      // Increment enrolledCount on the course
      const courseRef = getAdminDb().collection('courses').doc(courseId)
      batch.update(courseRef, { enrolledCount: FieldValue.increment(1) })
    }

    await batch.commit()

    return NextResponse.json({ success: true, orderId: orderRef.id })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
