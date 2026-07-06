// app/api/admin/users/[uid]/revoke-session/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getAdminDb, logLoginEvent } from '@/lib/firebase-admin'

export async function POST(req: NextRequest, { params }: { params: { uid: string } }) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userRef = getAdminDb().collection('users').doc(params.uid)
  const userDoc = await userRef.get()
  if (!userDoc.exists) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  const data = userDoc.data()

  await logLoginEvent(params.uid, 'revoked_by_admin', {
    deviceId: data?.activeDeviceId,
    deviceLabel: data?.activeDeviceLabel,
    sessionId: data?.activeSessionId,
  })

  // Overwrite with a sentinel that can never match a real deviceId/sessionId:
  // the client's onSnapshot listener force-signs-out on its next tick (an
  // empty/deleted field would be falsy and skip that mismatch check), and any
  // in-flight video signed-url request for the old session is rejected too.
  await userRef.update({
    activeDeviceId: 'revoked_by_admin',
    activeDeviceLabel: 'Revoked by admin',
    activeSessionId: 'revoked_by_admin',
  })

  return NextResponse.json({ success: true })
}
