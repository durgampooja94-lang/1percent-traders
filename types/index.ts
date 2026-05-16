// types/index.ts

export interface User {
  uid: string
  phone: string
  name: string
  email?: string
  role: 'user' | 'admin'
  createdAt: string
  photoURL?: string
  profileComplete?: boolean
}

export interface Course {
  id: string
  title: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  thumbnailUrl: string
  previewVideoId?: string
  published: boolean
  totalVideos: number
  totalDuration: number // in minutes
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  language: string
  tags: string[]
  requirements?: string[]
  whatYoullLearn?: string[]
  about?: string
  instructor?: string
  playlists?: Playlist[]
  createdAt: string
  updatedAt: string
  enrolledCount?: number
}

export interface Playlist {
  id: string
  courseId: string
  title: string
  order: number
  videos?: Video[]
}

export interface Video {
  id: string
  playlistId: string
  courseId: string
  title: string
  bunnyVideoId: string
  duration: number // in seconds
  order: number
  isFreePreview: boolean
  thumbnailUrl?: string
}

export interface Order {
  id: string
  userId: string
  userPhone?: string
  userName?: string
  courseIds: string[]
  courses?: Course[]
  amount: number
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  status: 'created' | 'paid' | 'failed' | 'refunded'
  couponCode?: string
  discountAmount?: number
  createdAt: string
}

export interface Purchase {
  courseId: string
  orderId: string
  purchasedAt: string
  amount: number
}

export interface Progress {
  videoId: string
  courseId: string
  completed: boolean
  watchedSeconds: number
  lastWatched: string
}

export interface CourseProgress {
  courseId: string
  completedVideos: number
  totalVideos: number
  percentage: number
  lastWatchedVideoId?: string
}

export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  maxUses: number
  usedCount: number
  expiresAt: string
  isActive: boolean
}

export interface CartItem {
  course: Course
  quantity: 1
}

export interface AdminStats {
  totalRevenue: number
  totalUsers: number
  totalOrders: number
  totalCourses: number
  revenueToday: number
  revenueThisMonth: number
  recentOrders: Order[]
}
