import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebaseAdmin'
import { requireAuth } from '@/lib/requireAuth'
import { logActivity } from '@/lib/firestore'

// PATCH /api/staff/[id] — super_admin only. Update role/assignedVerticals/active.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if ('role' in body) update.role = body.role
  if ('assignedVerticals' in body) update.assignedVerticals = body.assignedVerticals
  if ('active' in body) update.active = body.active
  if ('name' in body) update.name = body.name

  await adminDb().collection('staff').doc(params.id).update(update)
  await logActivity(`Staff account ${params.id} updated`, 'edit', staff.email)

  return NextResponse.json({ success: true })
}

// DELETE /api/staff/[id] — super_admin only. Removes both the Auth user and the staff doc.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (params.id === staff.uid) {
    return NextResponse.json({ success: false, message: "You can't delete your own account" }, { status: 400 })
  }

  await adminAuth().deleteUser(params.id).catch(() => {})
  await adminDb().collection('staff').doc(params.id).delete()
  await logActivity(`Staff account ${params.id} removed`, 'delete', staff.email)

  return NextResponse.json({ success: true })
}
