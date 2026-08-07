import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { logActivity } from '@/lib/firestore'
import { requireAuth } from '@/lib/requireAuth'
import { TeamMember } from '@/types'

// GET /api/team — auth required (admin list, includes inactive)
export async function GET(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const snap = await adminDb().collection('team_members').orderBy('sortOrder').get()
  const team = snap.docs.map(d => ({ id: d.id, ...d.data() }) as TeamMember)
  return NextResponse.json({ success: true, team })
}

// POST /api/team — super_admin only
export async function POST(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const countSnap = await adminDb().collection('team_members').get()

  const ref = await adminDb().collection('team_members').add({
    name: body.name || '', role: body.role || '', bio: body.bio || '',
    photoMediaId: body.photoMediaId || null, active: true, sortOrder: countSnap.size,
  })

  await logActivity(`Team member "${body.name}" added`, 'edit', staff.email)
  return NextResponse.json({ success: true, id: ref.id })
}
