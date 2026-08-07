'use client'
import { createContext, useContext } from 'react'
import { StaffUser, VerticalSlug } from '@/types'

export const RoleContext = createContext<StaffUser | null>(null)

export function useStaff(): StaffUser {
  const staff = useContext(RoleContext)
  if (!staff) throw new Error('useStaff() called outside AdminAuthGuard')
  return staff
}

export function canAccessVertical(staff: StaffUser, slug: VerticalSlug): boolean {
  return staff.role === 'super_admin' || staff.assignedVerticals.includes(slug)
}
