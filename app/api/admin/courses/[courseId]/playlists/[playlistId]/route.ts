export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string; playlistId: string } }
) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  await getAdminDb()
    .collection('courses').doc(params.courseId)
    .collection('playlists').doc(params.playlistId)
    .update({ ...body, updatedAt: FieldValue.serverTimestamp() })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; playlistId: string } }
) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getAdminDb()
  const videosSnap = await db
    .collection('courses').doc(params.courseId)
    .collection('playlists').doc(params.playlistId)
    .collection('videos').get()

  const batch = db.batch()
  videosSnap.docs.forEach(d => batch.delete(d.ref))
  batch.delete(db.collection('courses').doc(params.courseId).collection('playlists').doc(params.playlistId))
  await batch.commit()

  // Recalculate totalVideos
  const playlistsSnap = await db.collection('courses').doc(params.courseId).collection('playlists').get()
  let totalVideos = 0
  for (const pl of playlistsSnap.docs) {
    const vSnap = await db.collection('courses').doc(params.courseId).collection('playlists').doc(pl.id).collection('videos').get()
    totalVideos += vSnap.size
  }
  await db.collection('courses').doc(params.courseId).update({ totalVideos, updatedAt: FieldValue.serverTimestamp() })

  return NextResponse.json({ success: true })
}
