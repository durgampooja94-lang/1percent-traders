'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Video, Lock, CheckCircle } from 'lucide-react'
import { Course } from '@/types'
import { useCart } from '@/hooks/useCart'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/index'
import { clsx } from 'clsx'

interface CourseCardProps {
  course: Course
  isPurchased?: boolean
}

export default function CourseCard({ course, isPurchased }: CourseCardProps) {
  const { addToCart, isInCart } = useCart()
  const router = useRouter()
  const inCart = isInCart(course.id)

  const handleAddToCart = () => {
    addToCart(course)
    router.push('/cart')
  }

  const levelColors = {
    Beginner: 'green' as const,
    Intermediate: 'gold' as const,
    Advanced: 'orange' as const,
  }

  return (
    <div className={clsx(
      'group bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden transition-all duration-300',
      'hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10'
    )}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-700 overflow-hidden">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-900/50 to-dark-700 flex items-center justify-center">
            <Video className="w-12 h-12 text-brand-500/50" />
          </div>
        )}
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={levelColors[course.level]}>{course.level}</Badge>
          {isPurchased && <Badge variant="green"><CheckCircle className="w-3 h-3 mr-1" />Purchased</Badge>}
        </div>
        {!isPurchased && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-brand-500 rounded-full p-4 shadow-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-brand-300 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{course.shortDescription}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Video className="w-3.5 h-3.5" />{course.totalVideos} videos
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />{course.totalDuration} min
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            {isPurchased ? (
              <span className="text-green-400 font-semibold text-sm">Purchased ✓</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-xl">₹{course.price.toLocaleString()}</span>
                {course.originalPrice && (
                  <span className="text-gray-500 text-sm line-through">₹{course.originalPrice.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>

          {isPurchased ? (
            <Link href={`/learn/${course.id}`}>
              <Button variant="secondary" size="sm">Continue</Button>
            </Link>
          ) : inCart ? (
            <Link href="/cart">
              <Button variant="primary" size="sm">Go to Cart</Button>
            </Link>
          ) : (
            <Link href={`/courses/${course.id}`}>
              <Button variant="primary" size="sm">View Course</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
