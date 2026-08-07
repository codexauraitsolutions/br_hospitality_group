import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/requireAuth'
import { getRecentActivity } from '@/lib/firestore'

// GET /api/activity — auth required. super_admin sees everything, manager sees
// only activity tied to their assigned verticals (or with no vertical, e.g. their own edits).
export async function GET(req: NextRequest) {
  const staff = await requireAuth(req)
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const all = await getRecentActivity(30)
  const activity = staff.role === 'super_admin'
    ? all
    : all.filter(a => !a.verticalSlug || staff.assignedVerticals.includes(a.verticalSlug))

  return NextResponse.json({ success: true, activity: activity.slice(0, 8) })
}
