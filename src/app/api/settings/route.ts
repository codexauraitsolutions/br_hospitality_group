import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getSiteSettings, logActivity } from '@/lib/firestore'
import { requireAuth } from '@/lib/requireAuth'

// GET has no request-dependent logic, so Next.js would otherwise statically optimize this
// route at build time — which silently drops the PUT handler (any non-GET method 405s with
// an empty body). Force it dynamic so PUT actually reaches a live serverless function.
export const dynamic = 'force-dynamic'

// GET /api/settings — PUBLIC (website + admin both read this)
export async function GET() {
  const settings = await getSiteSettings()
  return NextResponse.json({ success: true, settings })
}

// PUT /api/settings — super_admin only
export async function PUT(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  await adminDb().collection('settings').doc('site').set(body, { merge: true })
  await logActivity('Site settings updated', 'edit', staff.email)

  return NextResponse.json({ success: true })
}
