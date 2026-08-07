import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { requireAuth } from '@/lib/requireAuth'
import { logActivity } from '@/lib/firestore'
import { Booking } from '@/types'

async function loadAndCheck(req: NextRequest, id: string) {
  const doc = await adminDb().collection('bookings').doc(id).get()
  if (!doc.exists) return { error: NextResponse.json({ success: false, message: 'Not found' }, { status: 404 }) }
  const booking = { id: doc.id, ...doc.data() } as Booking

  const staff = await requireAuth(req, { verticalSlug: booking.verticalSlug })
  if (!staff) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  return { booking, staff }
}

// PATCH /api/bookings/[id] — update status (auth scoped to the booking's vertical)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await loadAndCheck(req, params.id)
  if (result.error) return result.error
  const { booking, staff } = result

  const body = await req.json()
  await adminDb().collection('bookings').doc(params.id).update({
    status: body.status, updatedAt: new Date().toISOString(),
  })
  await logActivity(`Booking #${params.id.slice(-6)} marked as ${body.status}`, 'edit', staff!.email, booking!.verticalSlug)

  return NextResponse.json({ success: true })
}

// DELETE /api/bookings/[id] — auth scoped to the booking's vertical
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await loadAndCheck(req, params.id)
  if (result.error) return result.error
  const { booking, staff } = result

  await adminDb().collection('bookings').doc(params.id).delete()
  await logActivity(`Booking #${params.id.slice(-6)} deleted`, 'delete', staff!.email, booking!.verticalSlug)

  return NextResponse.json({ success: true })
}
