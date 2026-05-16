// app/api/admin/courses/[courseId]/playlists/[playlistId]/videos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string; playlistId: string } }
) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  const videoRef = await getAdminDb()
    .collection('courses').doc(params.courseId)
    .collection('playlists').doc(params.playlistId)
    .collection('videos')
    .add({
      ...body,
      courseId: params.courseId,
      playlistId: params.playlistId,
      createdAt: FieldValue.serverTimestamp(),
    })

  // Update totalVideos count on course
  const playlistsSnap = await getAdminDb()
    .collection('courses').doc(params.courseId)
    .collection('playlists')
    .get()

  let totalVideos = 0
  for (const pl of playlistsSnap.docs) {
    const vSnap = await getAdminDb()
      .collection('courses').doc(params.courseId)
      .collection('playlists').doc(pl.id)
      .collection('videos').get()
    totalVideos += vSnap.size
  }

  await getAdminDb().collection('courses').doc(params.courseId).update({
    totalVideos,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ id: videoRef.id })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string; playlistId: string } }
) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const videoId = searchParams.get('videoId')
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })

  const body = await req.json()
  await getAdminDb()
    .collection('courses').doc(params.courseId)
    .collection('playlists').doc(params.playlistId)
    .collection('videos').doc(videoId)
    .update({ ...body, updatedAt: FieldValue.serverTimestamp() })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; playlistId: string } }
) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const videoId = searchParams.get('videoId')
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })

  await getAdminDb()
    .collection('courses').doc(params.courseId)
    .collection('playlists').doc(params.playlistId)
    .collection('videos').doc(videoId)
    .delete()

  return NextResponse.json({ success: true })
}
