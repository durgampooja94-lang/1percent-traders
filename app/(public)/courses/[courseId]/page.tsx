'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import Navbar from '@/components/layout/Navbar'
import { Course, Playlist } from '@/types'
import {
  CheckCircle, Lock, ChevronDown, ShoppingCart, Play,
  Clock, Video, Tag, User, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { Spinner } from '@/components/ui/index'

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const { addToCart, isInCart } = useCart()
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [isPurchased, setIsPurchased] = useState(false)
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const courseDoc = await getDoc(doc(db, 'courses', courseId))
        if (!courseDoc.exists()) { router.push('/'); return }
        setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course)

        const playlistsSnap = await getDocs(query(collection(db, 'courses', courseId, 'playlists'), orderBy('order')))
        const pls = await Promise.all(playlistsSnap.docs.map(async pDoc => {
          const videosSnap = await getDocs(query(collection(db, 'courses', courseId, 'playlists', pDoc.id, 'videos'), orderBy('order')))
          const videos = videosSnap.docs.map(v => ({ id: v.id, ...v.data() } as any))
          return { id: pDoc.id, ...pDoc.data(), videos } as Playlist
        }))
        setPlaylists(pls)
        if (pls.length > 0) setExpandedPlaylist(pls[0].id)

        if (user) {
          const purchaseDoc = await getDoc(doc(db, 'users', user.uid, 'purchases', courseId))
          setIsPurchased(purchaseDoc.exists())
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [courseId, user])

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  if (!course) return null

  const inCart = isInCart(courseId)
  const totalVideos = playlists.reduce((acc, p) => acc + (p.videos?.length || 0), 0)

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="bg-dark-800 border-b border-dark-600">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/#courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left: Details */}
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-brand-500/15 text-brand-400 text-xs font-semibold px-3 py-1 rounded-full border border-brand-500/20">
                    {course.level}
                  </span>
                  {course.tags?.map(tag => (
                    <span key={tag} className="bg-dark-600 text-gray-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />{tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">{course.title}</h1>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">{course.shortDescription}</p>

                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5"><Video className="w-4 h-4" />{totalVideos} videos</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.language}</span>
                  {course.instructor && (
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{course.instructor}</span>
                  )}
                </div>
              </div>

              {/* Right: Buy card */}
              <div className="lg:col-span-1">
                <div className="bg-dark-900 border border-dark-500 rounded-2xl overflow-hidden sticky top-24">
                  {course.thumbnailUrl && (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full aspect-video object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-black text-white">₹{course.price.toLocaleString()}</span>
                      {course.originalPrice && (
                        <span className="text-gray-500 text-lg line-through">₹{course.originalPrice.toLocaleString()}</span>
                      )}
                      {course.originalPrice && (
                        <span className="text-green-400 text-sm font-bold">
                          {Math.round((1 - course.price / course.originalPrice) * 100)}% off
                        </span>
                      )}
                    </div>

                    {isPurchased ? (
                      <Link href={`/learn/${courseId}`}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-colors">
                        <Play className="w-5 h-5 fill-white" /> Continue Learning
                      </Link>
                    ) : inCart ? (
                      <Link href="/cart"
                        className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity">
                        <ShoppingCart className="w-5 h-5" /> Go to Cart
                      </Link>
                    ) : (
                      <button onClick={() => { addToCart(course); router.push('/cart') }}
                        className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity">
                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                      </button>
                    )}


                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            {course.whatYoullLearn && course.whatYoullLearn.length > 0 && (
              <section>
                <h2 className="text-white font-black text-xl mb-5">What You'll Learn</h2>
                <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.whatYoullLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <section>
                <h2 className="text-white font-black text-xl mb-5">Requirements</h2>
                <ul className="space-y-2.5">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* About */}
            {course.about && (
              <section>
                <h2 className="text-white font-black text-xl mb-5">About This Course</h2>
                <p className="text-gray-400 text-base leading-relaxed whitespace-pre-line">{course.about}</p>
              </section>
            )}

            {/* Curriculum */}
            <section>
              <h2 className="text-white font-black text-xl mb-2">Course Curriculum</h2>
              <p className="text-gray-500 text-sm mb-5">{totalVideos} videos · {playlists.length} sections</p>
              <div className="space-y-2">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedPlaylist(expandedPlaylist === playlist.id ? null : playlist.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-dark-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', expandedPlaylist === playlist.id && 'rotate-180')} />
                        <span className="text-white font-semibold text-sm">{playlist.title}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{playlist.videos?.length || 0} videos</span>
                    </button>
                    {expandedPlaylist === playlist.id && (
                      <div className="divide-y divide-dark-700 border-t border-dark-700">
                        {(playlist.videos as any[] || []).map((video: any) => (
                          <div key={video.id} className="flex items-center gap-3 px-5 py-3">
                            {video.isFreePreview ? (
                              <Play className="w-4 h-4 text-brand-400 flex-shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            )}
                            <span className={clsx('text-sm flex-1', video.isFreePreview ? 'text-brand-300' : 'text-gray-400')}>
                              {video.title}
                            </span>
                            {video.isFreePreview && (
                              <span className="text-xs text-brand-400 font-medium bg-brand-500/10 px-2 py-0.5 rounded-full">Preview</span>
                            )}
                            {!video.isFreePreview && !isPurchased && (
                              <Lock className="w-3.5 h-3.5 text-gray-600" />
                            )}
                            <span className="text-gray-600 text-xs">
                              {Math.floor((video.duration || 0) / 60)}:{String((video.duration || 0) % 60).padStart(2, '0')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
