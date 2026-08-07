import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getVerticals, logActivity } from '@/lib/firestore'
import { requireAuth } from '@/lib/requireAuth'

// GET /api/verticals — PUBLIC (website + admin sidebar both read this)
export async function GET(req: NextRequest) {
  const onlyLive = new URL(req.url).searchParams.get('onlyLive') === 'true'
  const verticals = await getVerticals({ onlyLive })
  return NextResponse.json({ success: true, verticals })
}

// POST /api/verticals — super_admin only (adding a brand-new vertical/property)
export async function POST(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { slug, name, short, location, category } = body
  if (!slug || !name) {
    return NextResponse.json({ success: false, message: 'slug and name are required' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const existing = await adminDb().collection('verticals').doc(slug).get()
  if (existing.exists) {
    return NextResponse.json({ success: false, message: 'A vertical with this slug already exists' }, { status: 409 })
  }

  const countSnap = await adminDb().collection('verticals').get()

  await adminDb().collection('verticals').doc(slug).set({
    name, short: short || name, location: location || '', category: category || '',
    tagline: '', color: '#1a2d5a', icon: '🏨', about: '',
    highlights: [], amenities: [], status: 'draft',
    phone: '', whatsapp: '', googleMapsUrl: '',
    sortOrder: countSnap.size, createdAt: now, updatedAt: now,
  })

  await logActivity(`New vertical "${name}" created`, 'edit', staff.email, slug)
  return NextResponse.json({ success: true, slug })
}
