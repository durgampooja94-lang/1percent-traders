'use client'
// app/(auth)/learn/[courseId]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import VideoPlayer from '@/components/course/VideoPlayer'
import { Spinner } from '@/components/ui/index'
import { Course, Playlist, Video, Progress } from '@/types'

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [progress, setProgress] = useState<Record<string, Progress>>({})
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push(`/login?redirect=/learn/${courseId}`)
  }, [user, authLoading])

  useEffect(() => {
    if (!user || !courseId) return

    async function load() {
      try {
        // Check purchase
        const purchaseDoc = await getDoc(doc(db, 'users', user!.uid, 'purchases', courseId))
        if (!purchaseDoc.exists()) {
          router.push(`/courses/${courseId}`)
          return
        }
        setAuthorized(true)

        // Load course
        const courseDoc = await getDoc(doc(db, 'courses', courseId))
        if (!courseDoc.exists()) { router.push('/dashboard'); return }
        const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course
        setCourse(courseData)

        // Load playlists + videos
        const playlistsSnap = await getDocs(
          query(collection(db, 'courses', courseId, 'playlists'), orderBy('order'))
        )
        const playlistsWithVideos = await Promise.all(
          playlistsSnap.docs.map(async plDoc => {
            const videosSnap = await getDocs(
              query(collection(db, 'courses', courseId, 'playlists', plDoc.id, 'videos'), orderBy('order'))
            )
            const videos = videosSnap.docs.map(v => ({ id: v.id, ...v.data() } as Video))
            return { id: plDoc.id, ...plDoc.data(), videos } as Playlist
          })
        )
        setPlaylists(playlistsWithVideos)

        // Set first video
        const firstVideo = playlistsWithVideos[0]?.videos?.[0]
        if (firstVideo) setCurrentVideo(firstVideo)

        // Load progress
        const progressSnap = await getDocs(collection(db, 'users', user!.uid, 'progress'))
        const progressMap: Record<string, Progress> = {}
        progressSnap.docs.forEach(d => { progressMap[d.id] = d.data() as Progress })
        setProgress(progressMap)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, courseId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!authorized || !course || !currentVideo) return null

  return (
    <VideoPlayer
      course={course}
      currentVideo={currentVideo}
      playlists={playlists}
      progress={progress}
      onVideoSelect={setCurrentVideo}
    />
  )
}
