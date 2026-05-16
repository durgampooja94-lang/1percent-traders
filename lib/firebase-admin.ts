import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

function initAdmin() {
  if (getApps().length > 0) return getApps()[0]
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  })
}

export function getAdminDb() {
  return getFirestore(initAdmin())
}

export function getAdminAuth() {
  return getAuth(initAdmin())
}

export async function verifyToken(token: string) {
  try {
    return await getAdminAuth().verifyIdToken(token)
  } catch (e) {
    console.error('[Admin] verifyToken failed:', e)
    return null
  }
}

export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const doc = await getAdminDb().collection('users').doc(uid).get()
    return doc.data()?.role ?? null
  } catch (e) {
    console.error('[Admin] getUserRole failed:', e)
    return null
  }
}

export async function isAdmin(token: string): Promise<boolean> {
  const decoded = await verifyToken(token)
  if (!decoded) return false
  const role = await getUserRole(decoded.uid)
  return role === 'admin'
}
