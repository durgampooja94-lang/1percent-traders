// app/api/admin/courses/[courseId]/playlists/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const playlistsSnap = await getAdminDb()
    .collection('courses').doc(params.courseId)
    .collection('playlists')
    .orderBy('order')
    .get()

  const playlists = await Promise.all(playlistsSnap.docs.map(async pDoc => {
    const videosSnap = await getAdminDb()
      .collection('courses').doc(params.courseId)
      .collection('playlists').doc(pDoc.id)
      .collection('videos')
      .orderBy('order')
      .get()
    const videos = videosSnap.docs.map(v => ({ id: v.id, ...v.data() }))
    return { id: pDoc.id, ...pDoc.data(), videos }
  }))

  return NextResponse.json({ playlists })
}

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const ref = await getAdminDb()
    .collection('courses').doc(params.courseId)
    .collection('playlists')
    .add({ ...body, courseId: params.courseId, createdAt: FieldValue.serverTimestamp() })

  return NextResponse.json({ id: ref.id })
}
