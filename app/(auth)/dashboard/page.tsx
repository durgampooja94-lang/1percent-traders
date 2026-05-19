'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import CourseCard from '@/components/course/CourseCard'
import { Spinner } from '@/components/ui/index'
import { Course } from '@/types'
import { BookOpen, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/dashboard')
  }, [user, authLoading])

  useEffect(() => {
    if (!user) return
    async function fetchPurchases() {
      try {
        const ordersSnap = await getDocs(
          query(collection(db, 'orders'), where('userId', '==', user!.uid), where('status', '==', 'paid'))
        )
        const courseIds = Array.from(new Set(
          ordersSnap.docs.flatMap(d => d.data().courseIds || (d.data().courseId ? [d.data().courseId] : []))
        )) as string[]
        const courseData = await Promise.all(courseIds.map(id => getDoc(doc(db, 'courses', id))))
        setCourses(courseData.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Course)))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchPurchases()
  }, [user])

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Trader'}</span> 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">Continue your trading education journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: 'Enrolled Courses', value: courses.length },
          { icon: ShoppingBag, label: 'Completed', value: 0 },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-dark-800 border border-dark-600 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{value}</div>
              <div className="text-gray-500 text-xs">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      {courses.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 border border-dark-600 rounded-2xl">
          <div className="w-20 h-20 rounded-3xl bg-dark-700 border border-dark-500 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">No courses yet</h2>
          <p className="text-gray-400 text-sm mb-6">Start your trading journey by enrolling in a course.</p>
          <Link href="/#courses"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Explore Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-xl">My Courses</h2>
            <Link href="/#courses" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
              Browse more <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} isPurchased />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
