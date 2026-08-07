import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { logActivity } from '@/lib/firestore'
import { requireAuth } from '@/lib/requireAuth'
import { Testimonial } from '@/types'

// GET /api/testimonials — auth required (admin list, includes inactive ones)
export async function GET(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const snap = await adminDb().collection('testimonials').orderBy('sortOrder').get()
  const testimonials = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Testimonial)
  return NextResponse.json({ success: true, testimonials })
}

// POST /api/testimonials — super_admin only
export async function POST(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const countSnap = await adminDb().collection('testimonials').get()

  const ref = await adminDb().collection('testimonials').add({
    name: body.name || '', role: body.role || '', quote: body.quote || '',
    rating: body.rating || 5, verticalSlug: body.verticalSlug || null,
    avatarMediaId: body.avatarMediaId || null, showOnHome: !!body.showOnHome,
    active: true, sortOrder: countSnap.size, createdAt: new Date().toISOString(),
  })

  await logActivity(`Testimonial from "${body.name}" added`, 'edit', staff.email)
  return NextResponse.json({ success: true, id: ref.id })
}
