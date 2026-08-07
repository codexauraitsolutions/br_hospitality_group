import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { requireAuth } from '@/lib/requireAuth'
import { deleteFromS3 } from '@/lib/s3'
import { logActivity } from '@/lib/firestore'
import { MediaItem } from '@/types'

async function loadAndCheck(req: NextRequest, id: string) {
  const doc = await adminDb().collection('media').doc(id).get()
  if (!doc.exists) return { error: NextResponse.json({ success: false, message: 'Not found' }, { status: 404 }) }
  const media = { id: doc.id, ...doc.data() } as MediaItem

  const requiresSuperAdmin = !media.verticalSlug
  const staff = await requireAuth(req, requiresSuperAdmin ? { role: 'super_admin' } : { verticalSlug: media.verticalSlug! })
  if (!staff) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  return { media, staff }
}

// PATCH /api/media/[id] — update caption/sortOrder/active
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await loadAndCheck(req, params.id)
  if (result.error) return result.error
  const { media } = result

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if ('caption' in body) update.caption = body.caption
  if ('sortOrder' in body) update.sortOrder = body.sortOrder
  if ('active' in body) update.active = body.active

  await adminDb().collection('media').doc(params.id).update(update)
  void media
  return NextResponse.json({ success: true })
}

// DELETE /api/media/[id] — deletes the S3 object FIRST, then the Firestore record.
// This is the single delete-cascade path every media delete in the app goes through
// (vertical gallery/video, banner tiles, team photos, testimonial avatars).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await loadAndCheck(req, params.id)
  if (result.error) return result.error
  const { media, staff } = result

  await deleteFromS3(media.s3Key)
  await adminDb().collection('media').doc(params.id).delete()
  await logActivity(`Deleted media "${media.filename}" (removed from S3)`, 'delete', staff!.email, media.verticalSlug)

  return NextResponse.json({ success: true })
}
