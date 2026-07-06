import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

function initAdmin() {
  if (getApps().length > 0) return getApps()[0]
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!
        .replace(/\\n/g, '\n')
        .replace(/^["']|["']$/g, ''),
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

export type LoginHistoryEvent = 'login' | 'kicked' | 'revoked_by_admin' | 'logout'

export function parseDeviceLabel(userAgent: string | null): string {
  if (!userAgent) return 'Unknown device'
  const ua = userAgent
  let os = 'Unknown OS'
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let browser = 'Unknown browser'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/Chrome\//i.test(ua)) browser = 'Chrome'
  else if (/Firefox\//i.test(ua)) browser = 'Firefox'
  else if (/Safari\//i.test(ua)) browser = 'Safari'

  return `${browser} on ${os}`
}

export async function logLoginEvent(
  uid: string,
  event: LoginHistoryEvent,
  data: { deviceId?: string; deviceLabel?: string; ip?: string; userAgent?: string; sessionId?: string }
) {
  await getAdminDb()
    .collection('users')
    .doc(uid)
    .collection('loginHistory')
    .add({
      event,
      deviceId: data.deviceId || null,
      deviceLabel: data.deviceLabel || null,
      ip: data.ip || null,
      userAgent: data.userAgent || null,
      sessionId: data.sessionId || null,
      createdAt: new Date().toISOString(),
    })
}
