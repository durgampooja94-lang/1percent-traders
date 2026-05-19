'use client'
import { useState, useEffect } from 'react'
import { Course } from '@/types'
import CourseCard from '@/components/course/CourseCard'
import { Spinner } from '@/components/ui/index'
import { BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([])
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { user, getToken } = useAuth()

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => setCourses(d.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) { setPurchasedIds(new Set()); return }
    getToken().then(token => {
      if (!token) return
      fetch('/api/user/courses', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          const ids = (d.courses || []).map((c: any) => c.id)
          setPurchasedIds(new Set(ids))
        })
        .catch(console.error)
    })
  }, [user])

  return (
    <section id="courses" className="section-padding bg-dark-900">
      <div className="container-max">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-brand-400 text-sm font-medium">Our Courses</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Choose Your{' '}
            <span className="gradient-text">Learning Path</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Structured courses designed to take you from complete beginner to professional trader — at your own pace.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-dark-700 border border-dark-500 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg font-medium">Courses coming soon</p>
            <p className="text-gray-600 text-sm">We're preparing premium trading courses for you. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isPurchased={purchasedIds.has(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
