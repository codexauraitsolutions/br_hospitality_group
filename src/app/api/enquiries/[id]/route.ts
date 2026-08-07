import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { requireAuth } from '@/lib/requireAuth'
import { logActivity } from '@/lib/firestore'

// PATCH /api/enquiries/[id] — super_admin only (mark read/replied, add notes)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if ('status' in body) {
    update.status = body.status
    if (body.status === 'replied') update.repliedAt = new Date().toISOString()
  }
  if ('adminNotes' in body) update.adminNotes = body.adminNotes

  await adminDb().collection('enquiries').doc(params.id).update(update)
  await logActivity(`Enquiry #${params.id.slice(-6)} updated`, 'edit', staff.email)

  return NextResponse.json({ success: true })
}

// DELETE /api/enquiries/[id] — super_admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await adminDb().collection('enquiries').doc(params.id).delete()
  await logActivity(`Enquiry #${params.id.slice(-6)} deleted`, 'delete', staff.email)

  return NextResponse.json({ success: true })
}
