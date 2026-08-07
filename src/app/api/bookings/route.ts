import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { requireAuth } from '@/lib/requireAuth'
import { logActivity } from '@/lib/firestore'
import { Booking, VerticalSlug } from '@/types'

// GET /api/bookings — auth required. super_admin sees all, manager sees only their verticals.
// Optional ?vertical=slug to filter to one vertical (still access-checked).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const verticalFilter = searchParams.get('vertical') as VerticalSlug | null

  const staff = await requireAuth(req, verticalFilter ? { verticalSlug: verticalFilter } : undefined)
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let query: FirebaseFirestore.Query = adminDb().collection('bookings')
  if (verticalFilter) query = query.where('verticalSlug', '==', verticalFilter)

  const snap = await query.get()
  let bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Booking)
  bookings.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  if (staff.role !== 'super_admin') {
    bookings = bookings.filter(b => staff.assignedVerticals.includes(b.verticalSlug))
  }

  return NextResponse.json({ success: true, bookings })
}

// POST /api/bookings — PUBLIC (the booking form on each vertical's detail page)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { verticalSlug, name, phone, email, eventDate, guests, eventType, message } = body

  if (!verticalSlug || !name?.trim() || !phone?.trim() || !eventDate || !guests || !eventType) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const ref = await adminDb().collection('bookings').add({
    verticalSlug, name: name.trim(), phone: phone.trim(), email: email?.trim() || '',
    eventDate, guests: Number(guests), eventType, message: message || '',
    status: 'new', createdAt: now, updatedAt: now,
  })

  await logActivity(`New booking enquiry from ${name} for ${verticalSlug}`, 'booking', 'website', verticalSlug)

  return NextResponse.json({ success: true, id: ref.id })
}
