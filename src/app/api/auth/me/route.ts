import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/requireAuth'

// GET /api/auth/me — returns the caller's own staff record, or 401.
export async function GET(req: NextRequest) {
  const staff = await requireAuth(req)
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ success: true, staff })
}
