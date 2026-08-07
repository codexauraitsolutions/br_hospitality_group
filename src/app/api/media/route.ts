import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getMedia, logActivity } from '@/lib/firestore'
import { requireAuth } from '@/lib/requireAuth'
import { MediaItem, MediaSection, VerticalSlug } from '@/types'

const VERTICAL_SCOPED_SECTIONS: MediaSection[] = ['vertical_gallery', 'vertical_video', 'vertical_cover']

// GET /api/media — auth required (admin panel media library / vertical media tab)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const section = searchParams.get('section') as MediaSection | null
  const verticalSlug = searchParams.get('verticalSlug') as VerticalSlug | null

  const staff = await requireAuth(req, verticalSlug ? { verticalSlug } : undefined)
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let items: MediaItem[]
  if (verticalSlug) {
    items = await getMedia({ section: section || undefined, verticalSlug })
  } else if (staff.role === 'super_admin') {
    items = await getMedia({ section: section || undefined })
  } else {
    // Manager with no vertical filter: only their assigned verticals' media.
    const all = await getMedia({ section: section || undefined })
    items = all.filter(m => m.verticalSlug && staff.assignedVerticals.includes(m.verticalSlug))
  }

  return NextResponse.json({ success: true, media: items })
}

// POST /api/media — auth required. Creates the Firestore record AFTER the browser
// has already PUT the file to S3 using a presigned URL from /api/upload/presign.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { section, verticalSlug, s3Key, url, type, filename, size, width, height, caption } = body as {
    section: MediaSection; verticalSlug?: VerticalSlug; s3Key: string; url: string; type: 'image' | 'video'
    filename: string; size: number; width?: number; height?: number; caption?: string
  }

  if (!section || !s3Key || !url || !type || !filename) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
  }

  const isVerticalScoped = VERTICAL_SCOPED_SECTIONS.includes(section)
  const staff = await requireAuth(req, isVerticalScoped ? { verticalSlug } : { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sectionSnap = await adminDb().collection('media').where('section', '==', section).get()
  const siblingCount = sectionSnap.docs.filter(d => (d.data().verticalSlug || null) === (verticalSlug || null)).length

  const ref = await adminDb().collection('media').add({
    section, verticalSlug: verticalSlug || null, s3Key, url, type, filename,
    size: size || 0, width: width || null, height: height || null,
    caption: caption || '', sortOrder: siblingCount, active: true,
    createdAt: new Date().toISOString(),
  })

  await logActivity(`Uploaded ${filename}`, 'upload', staff.email, verticalSlug || null)

  return NextResponse.json({ success: true, id: ref.id })
}
