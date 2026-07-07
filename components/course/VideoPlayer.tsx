'use client'
// components/course/VideoPlayer.tsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronDown, ChevronRight, Play, ArrowLeft, List, X, Maximize, Minimize } from 'lucide-react'
import { Course, Playlist, Video, Progress } from '@/types'
import { clsx } from 'clsx'
import VideoWatermark from './VideoWatermark'

interface VideoPlayerProps {
  course: Course
  currentVideo: Video
  playlists: Playlist[]
  progress: Record<string, Progress>
  embedUrl: string | null
  watermarkLabel: string
  onVideoSelect: (video: Video) => void
}

// Blocks common devtools shortcuts and right-click while the learn page is
// mounted. This is a best-effort deterrent, not real DRM — it cannot stop
// someone determined to bypass client-side JS, and can't reach into Bunny's
// cross-origin iframe content at all.
function useBrowserProtections() {
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const blocked =
        key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (key === 'I' || key === 'J')) ||
        (e.ctrlKey && key === 'U')
      if (blocked) e.preventDefault()
    }
    window.addEventListener('keydown', blockKeys)
    return () => window.removeEventListener('keydown', blockKeys)
  }, [])
}

// Bunny's own fullscreen button makes the <iframe> itself the browser's
// fullscreen element (its player runs inside a cross-origin document), which
// excludes sibling DOM nodes like our watermark from what's displayed — and
// there's no reliable, gesture-safe way to intercept and redirect that after
// the fact (requestFullscreen() must run inside a direct user gesture; doing
// it from a fullscreenchange/promise callback loses that and silently fails
// in most browsers). So instead we expose our own fullscreen toggle, which
// fullscreens our wrapper (iframe + watermark together) directly from a real
// click — Bunny's native button still works as before, it just won't carry
// the watermark into fullscreen.
function useFullscreenToggle(containerRef: React.RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFullscreenChange = () => {
      const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement || null
      setIsFullscreen(!!containerRef.current && fsEl === containerRef.current)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    }
  }, [containerRef])

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return
    const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement || null
    if (fsEl) {
      const exit = document.exitFullscreen?.bind(document) || (document as any).webkitExitFullscreen?.bind(document)
      exit?.()?.catch?.(() => {})
    } else {
      const request = container.requestFullscreen?.bind(container) || (container as any).webkitRequestFullscreen?.bind(container)
      request?.()?.catch?.(() => {})
    }
  }

  return { isFullscreen, toggleFullscreen }
}

export default function VideoPlayer({
  course, currentVideo, playlists, progress, embedUrl, watermarkLabel, onVideoSelect
}: VideoPlayerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [expandedPlaylists, setExpandedPlaylists] = useState<Record<string, boolean>>(
    () => playlists.length > 0 ? { [playlists[0].id]: true } : {}
  )
  const videoAreaRef = useRef<HTMLDivElement>(null)

  useBrowserProtections()
  const { isFullscreen, toggleFullscreen } = useFullscreenToggle(videoAreaRef)

  const togglePlaylist = (id: string) => {
    setExpandedPlaylists(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const isCompleted = (videoId: string) => progress[videoId]?.completed

  const handleVideoSelect = (video: Video) => {
    onVideoSelect(video)
    setMobileSidebarOpen(false)
  }

  const PlaylistContent = () => (
    <div className="flex-1 overflow-y-auto">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="border-b border-dark-700">
          <button
            onClick={() => togglePlaylist(playlist.id)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-dark-700 transition-colors"
          >
            <span className="text-gray-200 text-sm font-medium">{playlist.title}</span>
            <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', expandedPlaylists[playlist.id] && 'rotate-180')} />
          </button>

          {expandedPlaylists[playlist.id] && playlist.videos?.map((video) => {
            const isActive = video.id === currentVideo.id
            const completed = isCompleted(video.id)

            return (
              <button
                key={video.id}
                onClick={() => handleVideoSelect(video)}
                className={clsx(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-l-2',
                  isActive
                    ? 'bg-brand-500/10 border-brand-500 text-brand-300'
                    : 'border-transparent hover:bg-dark-700 text-gray-300 hover:text-white'
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {completed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : isActive ? (
                    <Play className="w-4 h-4 text-brand-400 fill-brand-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-dark-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug line-clamp-2">{video.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {video.duration || 0} min
                    </span>
                    {video.isFreePreview && (
                      <span className="text-xs text-brand-400 font-medium">Preview</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-dark-900">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 h-12 bg-dark-800 border-b border-dark-600 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
        <span className="text-dark-500 hidden sm:inline">|</span>
        <span className="text-gray-300 text-sm font-medium truncate flex-1">{course.title}</span>
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors shrink-0"
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full bg-dark-800 flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-dark-600 flex items-center justify-between sticky top-0 bg-dark-800 z-10">
              <div>
                <h2 className="text-white font-semibold text-sm">Course Content</h2>
                <p className="text-gray-400 text-xs mt-0.5">{course.totalVideos} videos</p>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <PlaylistContent />
          </div>
        </div>
      )}

      {/* Content row — desktop */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden">
          {/* Video Embed */}
          <div
            ref={videoAreaRef}
            className="relative bg-black w-full"
            style={
              // The padding-top trick sizes this box by percentage of its own
              // width, which conflicts with the browser's forced fullscreen
              // sizing (position:fixed, inset:0) — left in place, the box
              // ends up taller than the screen and the watermark's percentage
              // position resolves against that oversized box, landing below
              // the visible viewport. Drop the hack while fullscreen so the
              // box is just a plain 100%-of-viewport box instead.
              isFullscreen ? { width: '100%', height: '100%' } : { paddingTop: 'min(56.25%, 75vh)' }
            }
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="absolute inset-0" style={{ isolation: 'isolate' }}>
              {embedUrl ? (
                <>
                  <iframe
                    key={currentVideo.id}
                    src={embedUrl}
                    className="w-full h-full relative"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 'none', zIndex: 0 }}
                  />
                  <VideoWatermark label={watermarkLabel} />
                  <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit full screen' : 'Full screen with watermark protection'}
                    className="absolute bottom-14 right-2 sm:bottom-16 sm:right-3 z-[2147483647] flex items-center gap-1.5 sm:gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-semibold px-2.5 py-2 sm:px-3 shadow-lg transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4 shrink-0" /> : <Maximize className="w-4 h-4 shrink-0" />}
                    <span className="hidden sm:inline">{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-brand-500 ml-1" />
                    </div>
                    <p className="text-gray-400 text-sm">Loading video...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Info */}
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-white font-bold text-lg sm:text-xl mb-1">{currentVideo.title}</h1>
                <p className="text-gray-400 text-sm">{course.title}</p>
              </div>
              {isCompleted(currentVideo.id) && (
                <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium shrink-0">
                  <CheckCircle className="w-4 h-4" /> Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3">
              <Maximize className="w-3 h-3" />
              Use the "Full Screen" button on the video (not the player's own) to keep your watermark visible.
            </div>
          </div>
        </div>

        {/* Desktop sidebar toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center w-6 bg-dark-700 border-l border-dark-500 hover:bg-dark-600 transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronRight className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90" />}
        </button>

        {/* Desktop sidebar */}
        {sidebarOpen && (
          <div className="hidden lg:flex w-96 bg-dark-800 border-l border-dark-600 flex-col">
            <div className="p-4 border-b border-dark-600 sticky top-0 bg-dark-800 z-10 flex-shrink-0">
              <h2 className="text-white font-semibold text-sm">Course Content</h2>
              <p className="text-gray-400 text-xs mt-0.5">{course.totalVideos} videos</p>
            </div>
            <PlaylistContent />
          </div>
        )}
      </div>
    </div>
  )
}
