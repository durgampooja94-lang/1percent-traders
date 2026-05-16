// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getAdminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const snap = await getAdminDb().collection('users').orderBy('createdAt', 'desc').limit(200).get()
  const users = await Promise.all(snap.docs.map(async d => {
    const purchases = await getAdminDb().collection('users').doc(d.id).collection('purchases').get()
    return { id: d.id, ...d.data(), purchaseCount: purchases.size }
  }))
  return NextResponse.json({ users })
}
