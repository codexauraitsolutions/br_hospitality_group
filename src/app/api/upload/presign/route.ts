import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/requireAuth'
import { getPresignedUploadUrl, buildMediaKey } from '@/lib/s3'
import { MediaSection, VerticalSlug } from '@/types'

const VERTICAL_SCOPED_SECTIONS: MediaSection[] = ['vertical_gallery', 'vertical_video', 'vertical_cover']

// POST /api/upload/presign — returns a short-lived S3 PUT URL for the browser to upload directly to.
// Vertical-scoped sections (gallery/video/cover) require super_admin or a manager assigned to that vertical.
// Site-wide sections (banner/team/testimonial/logo) require super_admin.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { filename, contentType, section, verticalSlug } = body as {
    filename: string; contentType: string; section: MediaSection; verticalSlug?: VerticalSlug
  }

  if (!filename || !contentType || !section) {
    return NextResponse.json({ success: false, message: 'filename, contentType and section are required' }, { status: 400 })
  }

  const isVerticalScoped = VERTICAL_SCOPED_SECTIONS.includes(section)
  if (isVerticalScoped && !verticalSlug) {
    return NextResponse.json({ success: false, message: 'verticalSlug is required for this section' }, { status: 400 })
  }

  const staff = await requireAuth(req, isVerticalScoped ? { verticalSlug } : { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const key = buildMediaKey(section, verticalSlug || null, filename)
  const { url, publicUrl } = await getPresignedUploadUrl(key, contentType)

  return NextResponse.json({ success: true, uploadUrl: url, key, publicUrl })
}
