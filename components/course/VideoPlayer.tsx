'use client'
// components/course/VideoPlayer.tsx
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronDown, ChevronRight, Play, ArrowLeft } from 'lucide-react'
import { Course, Playlist, Video, Progress } from '@/types'
import { clsx } from 'clsx'

interface VideoPlayerProps {
  course: Course
  currentVideo: Video
  playlists: Playlist[]
  progress: Record<string, Progress>
  onVideoSelect: (video: Video) => void
}

export default function VideoPlayer({
  course, currentVideo, playlists, progress, onVideoSelect
}: VideoPlayerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedPlaylists, setExpandedPlaylists] = useState<Record<string, boolean>>(
    () => playlists.length > 0 ? { [playlists[0].id]: true } : {}
  )

  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID
  const embedUrl = currentVideo.bunnyVideoId && libraryId
    ? `https://iframe.mediadelivery.net/embed/${libraryId}/${currentVideo.bunnyVideoId}?autoplay=false&responsive=true`
    : null

  const togglePlaylist = (id: string) => {
    setExpandedPlaylists(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const isCompleted = (videoId: string) => progress[videoId]?.completed

  return (
    <div className="flex flex-col h-screen bg-dark-900">
      {/* Top bar with back button */}
      <div className="flex items-center gap-4 px-4 h-12 bg-dark-800 border-b border-dark-600 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-dark-500">|</span>
        <span className="text-gray-300 text-sm font-medium truncate">{course.title}</span>
      </div>

      {/* Content row */}
      <div className="flex flex-1 overflow-hidden">
      {/* Video Area */}
      <div className={clsx('flex-1 flex flex-col overflow-hidden', sidebarOpen ? 'mr-0' : '')}>
        {/* Video Embed */}
        <div className="relative bg-black aspect-video w-full">
          {embedUrl ? (
            <iframe
              key={currentVideo.id}
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
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

        {/* Video Info */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-white font-bold text-xl mb-1">{currentVideo.title}</h1>
              <p className="text-gray-400 text-sm">{course.title}</p>
            </div>
            {isCompleted(currentVideo.id) && (
              <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium shrink-0">
                <CheckCircle className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex items-center justify-center w-6 bg-dark-700 border-l border-dark-500 hover:bg-dark-600 transition-colors"
      >
        {sidebarOpen ? <ChevronRight className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90" />}
      </button>

      {/* Playlist Sidebar */}
      {sidebarOpen && (
        <div className="w-80 lg:w-96 bg-dark-800 border-l border-dark-600 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-dark-600 sticky top-0 bg-dark-800 z-10">
            <h2 className="text-white font-semibold text-sm">Course Content</h2>
            <p className="text-gray-400 text-xs mt-0.5">{course.totalVideos} videos</p>
          </div>

          <div className="flex-1">
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
                      onClick={() => onVideoSelect(video)}
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
                            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
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
        </div>
      )}
      </div>
    </div>
  )
}
