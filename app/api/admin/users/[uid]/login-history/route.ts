// app/api/admin/users/[uid]/login-history/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getAdminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest, { params }: { params: { uid: string } }) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const snap = await getAdminDb()
    .collection('users')
    .doc(params.uid)
    .collection('loginHistory')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()

  const history = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return NextResponse.json({ history })
}
