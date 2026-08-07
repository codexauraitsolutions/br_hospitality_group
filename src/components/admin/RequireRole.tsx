'use client'
import { useStaff, canAccessVertical } from '@/components/admin/RoleContext'
import { VerticalSlug } from '@/types'

function Denied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-4xl mb-3">🔒</div>
      <div className="font-semibold text-sm mb-1">Access Restricted</div>
      <div className="text-[12px] text-muted max-w-xs">
        You don&apos;t have permission to view this page. Contact a super admin if you believe this is a mistake.
      </div>
    </div>
  )
}

/** Wrap a page's content to require super_admin. */
export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const staff = useStaff()
  if (staff.role !== 'super_admin') return <Denied />
  return <>{children}</>
}

/** Wrap a page's content to require access to a specific vertical (super_admin, or an assigned manager). */
export function RequireVerticalAccess({ slug, children }: { slug: VerticalSlug; children: React.ReactNode }) {
  const staff = useStaff()
  if (!canAccessVertical(staff, slug)) return <Denied />
  return <>{children}</>
}
