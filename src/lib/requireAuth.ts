// Call this at the top of every protected admin API route.
// Verifies the Bearer Firebase ID token, loads the caller's staff doc,
// and (optionally) checks the caller has the required role/vertical scope.
//
// Usage:
//   const staff = await requireAuth(req)
//   if (!staff) return unauthorized()
//
//   const staff = await requireAuth(req, { role: 'super_admin' })
//   const staff = await requireAuth(req, { verticalSlug: 'pbr' })   // super_admin or a manager assigned to 'pbr'

import { NextRequest } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'
import { StaffUser, VerticalSlug } from '@/types'

interface RequireAuthOptions {
  role?: 'super_admin'
  verticalSlug?: VerticalSlug
}

export async function requireAuth(req: NextRequest, options: RequireAuthOptions = {}): Promise<StaffUser | null> {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return null

  let uid: string
  try {
    const decoded = await adminAuth().verifyIdToken(token)
    uid = decoded.uid
  } catch (err) {
    console.error('[requireAuth] verifyIdToken failed:', err)
    return null
  }

  const doc = await adminDb().collection('staff').doc(uid).get()
  if (!doc.exists) {
    console.error('[requireAuth] no staff doc for uid:', uid)
    return null
  }

  const staff = { uid, ...doc.data() } as StaffUser
  if (!staff.active) {
    console.error('[requireAuth] staff doc inactive for uid:', uid)
    return null
  }

  if (options.role === 'super_admin' && staff.role !== 'super_admin') return null

  if (options.verticalSlug && staff.role !== 'super_admin') {
    if (!staff.assignedVerticals?.includes(options.verticalSlug)) return null
  }

  return staff
}
