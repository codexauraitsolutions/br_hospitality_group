'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SiteSettings } from '@/types'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export default function NavBar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {(settings.phone1 || settings.tagline) && (
        <div className="bg-maroon text-white text-center text-[.63rem] tracking-[.22em] uppercase py-1.5 px-5 font-medium">
          {settings.tagline} {settings.phone1 && <><span className="text-gold2 mx-2.5">·</span>📞 {settings.phone1}</>}
        </div>
      )}

      <nav className="bg-white border-b border-border sticky top-0 z-[300] shadow-[0_2px_14px_rgba(0,0,0,.07)]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 md:px-10 h-[72px]">
          <Link href="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt={settings.siteName} className="h-11 w-11 object-contain flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 border-2 border-gold rounded-full flex items-center justify-center flex-col flex-shrink-0">
                <div className="font-serif text-[.95rem] font-semibold text-maroon leading-none">BR</div>
              </div>
            )}
            <div>
              <div className="font-serif text-[1.25rem] font-semibold text-maroon tracking-wide leading-none">{settings.siteName}</div>
              <div className="text-[.49rem] tracking-[.24em] uppercase text-muted mt-0.5">{settings.tagline}</div>
            </div>
          </Link>

          <ul className="hidden md:flex gap-7 list-none items-center">
            {LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href}
                  className={`text-[.67rem] font-semibold tracking-[.16em] uppercase transition-colors ${pathname === l.href ? 'text-maroon' : 'text-[#555] hover:text-maroon'}`}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="bg-gold text-white text-[.67rem] font-semibold tracking-[.16em] uppercase px-5 py-2.5 rounded hover:brightness-95 transition-all">
                Enquire Now
              </Link>
            </li>
          </ul>

          <button className="md:hidden text-2xl" onClick={() => setOpen(o => !o)} aria-label="Menu">☰</button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-[299]" onClick={() => setOpen(false)}>
          <div className="bg-white w-64 h-full ml-auto p-6 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-ink">{l.label}</Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)}
              className="bg-gold text-white text-center text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded">
              Enquire Now
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
