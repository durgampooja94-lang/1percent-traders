'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import VideoPlayer from '@/components/course/VideoPlayer'
import { Spinner } from '@/components/ui/index'
import { Course, Playlist, Video, Progress } from '@/types'

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user, loading: authLoading, getToken } = useAuth()
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
        const token = await getToken()

        // Check purchase via admin API (bypasses Firestore rules)
        const purchasesRes = await fetch('/api/user/courses', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const purchasesData = await purchasesRes.json()
        const hasPurchased = (purchasesData.courses || []).some((c: any) => c.id === courseId)
        if (!hasPurchased) {
          router.push(`/courses/${courseId}`)
          return
        }
        setAuthorized(true)

        // Load course + playlists + videos via existing admin API
        const courseRes = await fetch(`/api/courses/${courseId}`)
        if (!courseRes.ok) { router.push('/dashboard'); return }
        const courseData = await courseRes.json()
        setCourse(courseData.course as Course)
        const loadedPlaylists = courseData.playlists as Playlist[]
        setPlaylists(loadedPlaylists)

        const firstVideo = loadedPlaylists[0]?.videos?.[0] as Video | undefined
        if (firstVideo) setCurrentVideo(firstVideo)
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
