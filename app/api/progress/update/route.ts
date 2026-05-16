// app/api/progress/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { videoId, courseId, watchedSeconds, completed } = await req.json()

    await getAdminDb()
      .collection('users')
      .doc(decoded.uid)
      .collection('progress')
      .doc(videoId)
      .set({
        videoId,
        courseId,
        watchedSeconds: watchedSeconds || 0,
        completed: completed || false,
        lastWatched: FieldValue.serverTimestamp(),
      }, { merge: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
