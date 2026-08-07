'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { useStaff } from '@/components/admin/RoleContext'
import { Vertical } from '@/types'

export default function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const staff = useStaff()
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [logoUrl, setLogoUrl] = useState('')
  const onVerticalPage = pathname.startsWith('/admin/verticals/')
  const [verticalsOpen, setVerticalsOpen] = useState(onVerticalPage)

  useEffect(() => {
    if (onVerticalPage) setVerticalsOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    fetch('/api/verticals').then(r => r.json()).then(d => {
      if (d.success) setVerticals(d.verticals)
    }).catch(() => {})
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.success) setLogoUrl(d.settings.logoUrl)
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await signOut(getFirebaseAuth())
    router.push('/login')
  }

  const isSuperAdmin = staff.role === 'super_admin'
  const myVerticals = isSuperAdmin
    ? verticals
    : verticals.filter(v => staff.assignedVerticals.includes(v.slug))

  const isActive = (href: string) => pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))

  const navItemClass = (href: string) => `group flex items-center gap-3 rounded-lg text-[13px] transition-all relative ${
    collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
  } ${
    isActive(href)
      ? 'bg-white/[0.07] text-white font-medium'
      : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
  }`

  const activeBar = (href: string) => isActive(href) && (
    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r bg-gold" />
  )

  const sectionLabel = (text: string) => !collapsed && (
    <div className="px-3 pt-4 pb-1.5 text-[10px] tracking-[.16em] uppercase text-white/25 font-semibold">{text}</div>
  )

  return (
    <aside className={`bg-sb flex flex-col fixed h-screen z-50 transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className={`py-4 border-b border-white/[0.06] flex items-center gap-3 flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="w-9 h-9 object-contain flex-shrink-0 rounded-md" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-maroon border border-gold/30 flex items-center justify-center text-gold font-serif text-sm font-bold flex-shrink-0">
            BR
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-semibold text-[13px] tracking-wide leading-tight truncate">BR Hospitality</div>
            <div className="text-white/30 text-[9px] tracking-[2.5px] uppercase">Admin Panel</div>
          </div>
        )}
      </div>

      <button onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-sb2 border border-white/10 text-white/50 hover:text-white hover:border-white/25 flex items-center justify-center text-[11px] cursor-pointer transition-colors">
        {collapsed ? '›' : '‹'}
      </button>

      <nav className="thin-scroll flex-1 p-2.5 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {sectionLabel('Overview')}
        <Link href="/admin/dashboard" className={navItemClass('/admin/dashboard')} title="Dashboard">
          {activeBar('/admin/dashboard')}<span className="w-5 text-center flex-shrink-0">📊</span>{!collapsed && 'Dashboard'}
        </Link>
        <Link href="/admin/bookings" className={navItemClass('/admin/bookings')} title="Bookings">
          {activeBar('/admin/bookings')}<span className="w-5 text-center flex-shrink-0">📅</span>{!collapsed && 'Bookings'}
        </Link>
        {isSuperAdmin && (
          <Link href="/admin/enquiries" className={navItemClass('/admin/enquiries')} title="Enquiries">
            {activeBar('/admin/enquiries')}<span className="w-5 text-center flex-shrink-0">📩</span>{!collapsed && 'Enquiries'}
          </Link>
        )}

        {sectionLabel('Verticals')}
        {isSuperAdmin && (
          <Link href="/admin/verticals" className={navItemClass('/admin/verticals')} title="All Verticals">
            {activeBar('/admin/verticals')}<span className="w-5 text-center flex-shrink-0">📋</span>{!collapsed && 'All Verticals'}
          </Link>
        )}

        {collapsed ? (
          myVerticals.map(v => (
            <Link key={v.slug} href={`/admin/verticals/${v.slug}`} className={navItemClass(`/admin/verticals/${v.slug}`)} title={v.name}>
              {v.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.coverImageUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
              ) : (
                <span className="w-5 h-5 rounded flex-shrink-0" style={{ background: v.color }} />
              )}
            </Link>
          ))
        ) : myVerticals.length > 0 && (
          <div>
            <button onClick={() => setVerticalsOpen(o => !o)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all">
              <span className={`text-[9px] transition-transform ${verticalsOpen ? 'rotate-90' : ''}`}>▶</span>
              My Properties
              <span className="ml-auto text-[10px] bg-white/[0.06] text-white/40 rounded-full px-1.5 py-0.5">{myVerticals.length}</span>
            </button>
            {verticalsOpen && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {myVerticals.map(v => (
                  <Link key={v.slug} href={`/admin/verticals/${v.slug}`} className={navItemClass(`/admin/verticals/${v.slug}`) + ' pl-8'} title={v.name}>
                    {activeBar(`/admin/verticals/${v.slug}`)}
                    {v.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.coverImageUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
                    ) : (
                      <span className="w-5 h-5 rounded flex-shrink-0" style={{ background: v.color }} />
                    )}
                    <span className="truncate">{v.short}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {sectionLabel('Content')}
        <Link href="/admin/media" className={navItemClass('/admin/media')} title="All Media">
          {activeBar('/admin/media')}<span className="w-5 text-center flex-shrink-0">🖼️</span>{!collapsed && 'All Media'}
        </Link>
        {isSuperAdmin && (
          <Link href="/admin/testimonials" className={navItemClass('/admin/testimonials')} title="Testimonials">
            {activeBar('/admin/testimonials')}<span className="w-5 text-center flex-shrink-0">💬</span>{!collapsed && 'Testimonials'}
          </Link>
        )}
        {isSuperAdmin && (
          <Link href="/admin/team" className={navItemClass('/admin/team')} title="Team">
            {activeBar('/admin/team')}<span className="w-5 text-center flex-shrink-0">👤</span>{!collapsed && 'Team'}
          </Link>
        )}

        {isSuperAdmin && (
          <>
            {sectionLabel('Settings')}
            <Link href="/admin/banners" className={navItemClass('/admin/banners')} title="Banners & Display">
              {activeBar('/admin/banners')}<span className="w-5 text-center flex-shrink-0">🎛️</span>{!collapsed && 'Banners & Display'}
            </Link>
            <Link href="/admin/settings" className={navItemClass('/admin/settings')} title="Site Settings">
              {activeBar('/admin/settings')}<span className="w-5 text-center flex-shrink-0">⚙️</span>{!collapsed && 'Site Settings'}
            </Link>
            <Link href="/admin/seo" className={navItemClass('/admin/seo')} title="SEO & Meta">
              {activeBar('/admin/seo')}<span className="w-5 text-center flex-shrink-0">🔍</span>{!collapsed && 'SEO & Meta'}
            </Link>
            <Link href="/admin/staff" className={navItemClass('/admin/staff')} title="Staff">
              {activeBar('/admin/staff')}<span className="w-5 text-center flex-shrink-0">🧑‍💼</span>{!collapsed && 'Staff'}
            </Link>
          </>
        )}
      </nav>

      <div className="p-2.5 border-t border-white/[0.06] flex flex-col gap-0.5 flex-shrink-0">
        {!collapsed && (
          <div className="px-3 py-2 text-[11px] text-white/30 truncate" title={staff.email}>
            {staff.name || staff.email}
            <div className="text-[9px] text-gold/50 uppercase tracking-wider mt-0.5">{staff.role.replace('_', ' ')}</div>
          </div>
        )}
        <Link href="/" target="_blank" title="View Website"
          className={`flex items-center gap-3 rounded-lg text-[12px] text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all ${collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'}`}>
          <span className="w-5 text-center flex-shrink-0">🌐</span>{!collapsed && 'View Website ↗'}
        </Link>
        <button onClick={handleLogout} title="Sign Out"
          className={`flex items-center gap-3 rounded-lg text-[12px] text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-all w-full ${collapsed ? 'justify-center px-0 py-2' : 'text-left px-3 py-2'}`}>
          <span className="w-5 text-center flex-shrink-0">🚪</span>{!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
