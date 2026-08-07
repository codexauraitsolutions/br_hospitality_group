import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { requireAuth } from '@/lib/requireAuth'
import { logActivity } from '@/lib/firestore'
import { Enquiry } from '@/types'

// GET /api/enquiries — super_admin only (general inbox, not scoped to a vertical)
export async function GET(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = new URL(req.url).searchParams.get('status')
  let query: FirebaseFirestore.Query = adminDb().collection('enquiries')
  if (status && status !== 'all') query = query.where('status', '==', status)

  const snap = await query.get()
  const enquiries = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Enquiry)
  enquiries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return NextResponse.json({ success: true, enquiries })
}

// POST /api/enquiries — PUBLIC (the general Contact page form)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, venueSlug, eventType, message } = body

  if (!name?.trim() || !phone?.trim() || !message?.trim()) {
    return NextResponse.json({ success: false, message: 'Name, phone and message are required' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const ref = await adminDb().collection('enquiries').add({
    name: name.trim(), phone: phone.trim(), email: email?.trim() || '',
    venueSlug: venueSlug || 'general', eventType: eventType || '', message: message.trim(),
    status: 'new', adminNotes: '', createdAt: now, repliedAt: null,
  })

  await logActivity(`New enquiry from ${name}`, 'enquiry', 'website')

  return NextResponse.json({ success: true, id: ref.id, message: "Thanks! We'll be in touch within 24 hours." })
}
