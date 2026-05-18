export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const db = getAdminDb()

    const courseDoc = await db.collection('courses').doc(courseId).get()
    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const course = { id: courseDoc.id, ...courseDoc.data() }

    const playlistsSnap = await db
      .collection('courses')
      .doc(courseId)
      .collection('playlists')
      .orderBy('order', 'asc')
      .get()

    const playlists = await Promise.all(
      playlistsSnap.docs.map(async (p) => {
        const videosSnap = await db
          .collection('courses')
          .doc(courseId)
          .collection('playlists')
          .doc(p.id)
          .collection('videos')
          .orderBy('order', 'asc')
          .get()

        const videos = videosSnap.docs.map(v => ({
          id: v.id,
          ...v.data()
        }))

        return { id: p.id, ...p.data(), videos }
      })
    )

    return NextResponse.json({ course, playlists })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
