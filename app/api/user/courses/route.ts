export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getAdminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const db = getAdminDb()

    const ordersSnap = await db.collection('orders')
      .where('userId', '==', decoded.uid)
      .where('status', '==', 'paid')
      .get()

    const courseIds = Array.from(new Set(
      ordersSnap.docs.flatMap(d => {
        const data = d.data()
        return data.courseIds || (data.courseId ? [data.courseId] : [])
      })
    )) as string[]

    const courses = await Promise.all(
      courseIds.map(async id => {
        const doc = await db.collection('courses').doc(id).get()
        return doc.exists ? { id: doc.id, ...doc.data() } : null
      })
    )

    return NextResponse.json({ courses: courses.filter(Boolean) })
  } catch (error) {
    console.error('Error fetching user courses:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
