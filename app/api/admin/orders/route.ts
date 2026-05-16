// app/api/admin/orders/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getAdminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1]
  if (!token || !(await isAdmin(token))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '100')

  const snap = await getAdminDb().collection('orders').orderBy('createdAt', 'desc').limit(limit).get()
  const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Compute stats
  const totalRevenue = orders.filter((o: any) => o.status === 'paid').reduce((sum: number, o: any) => sum + (o.amount || 0), 0)
  const today = new Date(); today.setHours(0,0,0,0)
  const revenueToday = orders.filter((o: any) => o.status === 'paid' && o.createdAt?.toDate?.() >= today)
    .reduce((sum: number, o: any) => sum + (o.amount || 0), 0)

  return NextResponse.json({ orders, stats: { totalRevenue, revenueToday } })
}
