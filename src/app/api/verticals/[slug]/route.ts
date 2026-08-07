import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getVerticalBySlug, logActivity } from '@/lib/firestore'
import { requireAuth } from '@/lib/requireAuth'
import { deleteFromS3 } from '@/lib/s3'
import { VerticalSlug } from '@/types'

// GET /api/verticals/[slug] — PUBLIC
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const vertical = await getVerticalBySlug(params.slug)
  if (!vertical) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, vertical })
}

// PUT /api/verticals/[slug] — super_admin, or a manager assigned to this vertical
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug as VerticalSlug
  const staff = await requireAuth(req, { verticalSlug: slug })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['name', 'short', 'location', 'category', 'tagline', 'color', 'icon', 'about',
    'highlights', 'amenities', 'status', 'phone', 'whatsapp', 'googleMapsUrl',
    'coverImageUrl', 'coverMediaId', 'externalUrl']
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  for (const key of allowed) if (key in body) update[key] = body[key]

  await adminDb().collection('verticals').doc(slug).update(update)
  await logActivity(`${body.name || slug} details updated`, 'edit', staff.email, slug)

  return NextResponse.json({ success: true })
}

// DELETE /api/verticals/[slug] — super_admin only. Cascades: deletes every media file
// (and its S3 object) that belongs to this vertical before removing the vertical doc.
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug as VerticalSlug
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const mediaSnap = await adminDb().collection('media').where('verticalSlug', '==', slug).get()
  for (const doc of mediaSnap.docs) {
    const key = doc.data().s3Key as string | undefined
    if (key) await deleteFromS3(key).catch(() => {})
    await doc.ref.delete()
  }

  await adminDb().collection('verticals').doc(slug).delete()
  await logActivity(`Vertical "${slug}" deleted (${mediaSnap.size} media files removed from S3)`, 'delete', staff.email, slug)

  return NextResponse.json({ success: true })
}
