'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import CourseCard from '@/components/course/CourseCard'
import { Spinner } from '@/components/ui/index'
import { Course } from '@/types'
import { BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchPurchases() {
      try {
        const purchasesSnap = await getDocs(collection(db, 'users', user!.uid, 'purchases'))
        const courseIds = purchasesSnap.docs.map(d => d.id)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">My Courses</h1>
        <p className="text-gray-400 text-sm mt-1">Your enrolled courses</p>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} isPurchased />
          ))}
        </div>
      )}
    </div>
  )
}
