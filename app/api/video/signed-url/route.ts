// app/api/video/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getAdminDb } from '@/lib/firebase-admin'
import { getBunnyEmbedUrl } from '@/lib/bunny'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('videoId')
    const courseId = searchParams.get('courseId')

    if (!videoId || !courseId) {
      return NextResponse.json({ error: 'Missing videoId or courseId' }, { status: 400 })
    }

    // Get video metadata from Firestore to find bunnyVideoId
    // (search through playlists subcollection)
    const playlistsSnap = await getAdminDb()
      .collection('courses')
      .doc(courseId)
      .collection('playlists')
      .get()

    let bunnyVideoId: string | null = null
    let isFreePreview = false

    for (const playlistDoc of playlistsSnap.docs) {
      const videoDoc = await getAdminDb()
        .collection('courses')
        .doc(courseId)
        .collection('playlists')
        .doc(playlistDoc.id)
        .collection('videos')
        .doc(videoId)
        .get()

      if (videoDoc.exists) {
        bunnyVideoId = videoDoc.data()?.bunnyVideoId
        isFreePreview = videoDoc.data()?.isFreePreview || false
        break
      }
    }

    if (!bunnyVideoId) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check purchase (skip for free previews)
    if (!isFreePreview) {
      const purchaseDoc = await getAdminDb()
        .collection('users')
        .doc(decoded.uid)
        .collection('purchases')
        .doc(courseId)
        .get()

      if (!purchaseDoc.exists) {
        return NextResponse.json({ error: 'Course not purchased' }, { status: 403 })
      }
    }

    // Generate Bunny.net embed URL
    const embedUrl = getBunnyEmbedUrl(bunnyVideoId)

    return NextResponse.json({ embedUrl, bunnyVideoId })
  } catch (error) {
    console.error('Signed URL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
