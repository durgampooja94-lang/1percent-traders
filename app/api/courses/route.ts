import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection('courses')
      .where('published', '==', true)
      .get()
    const courses = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as any))
      .sort((a, b) => {
        const aTime = a.createdAt?._seconds ?? a.createdAt?.seconds ?? 0
        const bTime = b.createdAt?._seconds ?? b.createdAt?.seconds ?? 0
        return bTime - aTime
      })
    return NextResponse.json({ courses })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ courses: [] })
  }
}
