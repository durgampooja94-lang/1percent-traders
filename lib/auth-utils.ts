// lib/auth-utils.ts
import { adminAuth, adminDb } from './firebase-admin'
import { headers } from 'next/headers'

export async function getTokenFromHeaders(): Promise<string | null> {
  const headersList = headers()
  const authorization = headersList.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  return authorization.split('Bearer ')[1]
}

export async function getCurrentUser() {
  const token = await getTokenFromHeaders()
  if (!token) return null
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return null
    return { uid: decoded.uid, ...userDoc.data() }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser() as any
  if (!user || user.role !== 'admin') throw new Error('Forbidden')
  return user
}

export async function hasCoursePurchase(userId: string, courseId: string): Promise<boolean> {
  const purchaseDoc = await adminDb
    .collection('users')
    .doc(userId)
    .collection('purchases')
    .doc(courseId)
    .get()
  return purchaseDoc.exists
}
