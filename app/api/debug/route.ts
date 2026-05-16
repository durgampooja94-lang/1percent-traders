import { NextResponse } from 'next/server'

export async function GET() {
  const results: Record<string, any> = {}

  // Check env vars
  results.hasProjectId = !!process.env.FIREBASE_ADMIN_PROJECT_ID
  results.hasClientEmail = !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  results.hasPrivateKey = !!process.env.FIREBASE_ADMIN_PRIVATE_KEY
  results.projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  results.clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  results.privateKeyStart = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.slice(0, 40)

  // Try initializing Admin SDK
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin')
    const db = getAdminDb()
    const snap = await db.collection('users').limit(1).get()
    results.adminSdkOk = true
    results.userCount = snap.size
  } catch (e: any) {
    results.adminSdkOk = false
    results.adminSdkError = e.message
  }

  return NextResponse.json(results)
}
