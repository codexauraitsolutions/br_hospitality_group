import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebaseAdmin'
import { requireAuth } from '@/lib/requireAuth'
import { logActivity } from '@/lib/firestore'
import { StaffUser } from '@/types'

// GET /api/staff — super_admin only
export async function GET(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const snap = await adminDb().collection('staff').orderBy('createdAt', 'desc').get()
  const list = snap.docs.map(d => ({ uid: d.id, ...d.data() }) as StaffUser)
  return NextResponse.json({ success: true, staff: list })
}

// POST /api/staff — super_admin only. Creates the Firebase Auth user + staff doc.
export async function POST(req: NextRequest) {
  const staff = await requireAuth(req, { role: 'super_admin' })
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { email, password, name, role, assignedVerticals } = body

  if (!email || !password || !name) {
    return NextResponse.json({ success: false, message: 'email, password and name are required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 })
  }
  if (role !== 'super_admin' && role !== 'manager') {
    return NextResponse.json({ success: false, message: 'role must be super_admin or manager' }, { status: 400 })
  }

  let user
  try {
    user = await adminAuth().createUser({ email, password, displayName: name })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create user'
    return NextResponse.json({ success: false, message }, { status: 400 })
  }

  const now = new Date().toISOString()
  await adminDb().collection('staff').doc(user.uid).set({
    email, name, role,
    assignedVerticals: role === 'manager' ? (assignedVerticals || []) : [],
    active: true, createdAt: now,
  })

  await logActivity(`Staff account created for ${email} (${role})`, 'edit', staff.email)

  return NextResponse.json({ success: true, uid: user.uid })
}
