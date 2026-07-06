// app/api/auth/session/route.ts
export const dynamic = 'force-dynamic'
import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getAdminDb, logLoginEvent, parseDeviceLabel } from '@/lib/firebase-admin'

// Called once per explicit sign-in (not on every token refresh/page reload).
// Establishes this device as the account's sole active session, logging out
// whichever device previously held it.
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const deviceId: string | undefined = body.deviceId
    if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })

    const userAgent = req.headers.get('user-agent')
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const deviceLabel = parseDeviceLabel(userAgent)
    const sessionId = randomUUID()

    const userRef = getAdminDb().collection('users').doc(decoded.uid)
    const userDoc = await userRef.get()
    const prev = userDoc.data()

    if (prev?.activeDeviceId && prev.activeDeviceId !== deviceId) {
      await logLoginEvent(decoded.uid, 'kicked', {
        deviceId: prev.activeDeviceId,
        deviceLabel: prev.activeDeviceLabel,
        sessionId: prev.activeSessionId,
      })
    }

    await userRef.set(
      {
        activeDeviceId: deviceId,
        activeDeviceLabel: deviceLabel,
        activeSessionId: sessionId,
        lastLoginAt: new Date().toISOString(),
        lastLoginIp: ip,
        lastActiveAt: new Date().toISOString(),
      },
      { merge: true }
    )

    await logLoginEvent(decoded.uid, 'login', { deviceId, deviceLabel, ip, userAgent: userAgent || undefined, sessionId })

    return NextResponse.json({ sessionId, deviceId })
  } catch (error) {
    console.error('Session establish error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
