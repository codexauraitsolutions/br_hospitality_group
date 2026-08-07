import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { requireAuth } from '@/lib/requireAuth'

const COLLECTIONS = [
  'verticals', 'media', 'bookings', 'enquiries', 'testimonials',
  'team_members', 'settings', 'staff', 'activity',
] as const

// GET /api/backup — super_admin only. Exports every Firestore collection as one JSON
// snapshot. Note: this backs up database records only — uploaded files themselves stay
// safely in S3 and aren't re-downloaded here (their URLs are included in the media records).
export async function GET(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data: Record<string, unknown[]> = {}
  for (const name of COLLECTIONS) {
    const snap = await adminDb().collection(name).get()
    data[name] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  const backup = {
    exportedAt: new Date().toISOString(),
    exportedBy: staff.email,
    collections: data,
  }

  return NextResponse.json(backup, {
    headers: {
      'Content-Disposition': `attachment; filename="br-hospitality-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
