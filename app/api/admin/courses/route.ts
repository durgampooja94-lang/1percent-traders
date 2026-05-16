export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token || !(await isAdmin(token))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const snap = await getAdminDb().collection('courses').orderBy('createdAt', 'desc').get()
    const courses = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ courses })
  } catch (e: any) {
    console.error('GET /api/admin/courses error:', e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token || !(await isAdmin(token))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()
    const ref = await getAdminDb().collection('courses').add({
      ...body,
      published: true,
      totalVideos: 0,
      enrolledCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ id: ref.id })
  } catch (e: any) {
    console.error('POST /api/admin/courses error:', e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token || !(await isAdmin(token))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { id, ...updates } = await req.json()
    await getAdminDb().collection('courses').doc(id).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('PATCH /api/admin/courses error:', e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!token || !(await isAdmin(token))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await getAdminDb().collection('courses').doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('DELETE /api/admin/courses error:', e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
