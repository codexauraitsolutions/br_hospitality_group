import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { logActivity } from '@/lib/firestore'
import { requireAuth } from '@/lib/requireAuth'
import { deleteFromS3 } from '@/lib/s3'

// PATCH /api/team/[id] — super_admin only
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['name', 'role', 'bio', 'photoMediaId', 'active', 'sortOrder']
  const update: Record<string, unknown> = {}
  for (const key of allowed) if (key in body) update[key] = body[key]

  await adminDb().collection('team_members').doc(params.id).update(update)
  await logActivity('Team member updated', 'edit', staff.email)
  return NextResponse.json({ success: true })
}

// DELETE /api/team/[id] — super_admin only. Cascades: deletes the linked photo
// media (and its S3 object) if one was attached.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await adminDb().collection('team_members').doc(params.id).get()
  const photoMediaId = doc.data()?.photoMediaId as string | null | undefined

  if (photoMediaId) {
    const mediaDoc = await adminDb().collection('media').doc(photoMediaId).get()
    if (mediaDoc.exists) {
      const key = mediaDoc.data()?.s3Key as string | undefined
      if (key) await deleteFromS3(key).catch(() => {})
      await mediaDoc.ref.delete()
    }
  }

  await adminDb().collection('team_members').doc(params.id).delete()
  await logActivity('Team member deleted', 'delete', staff.email)
  return NextResponse.json({ success: true })
}
