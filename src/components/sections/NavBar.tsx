'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {(settings.phone1 || settings.tagline) && (
        <div className="bg-maroon text-white text-center text-[.63rem] tracking-[.22em] uppercase py-1.5 px-5 font-medium">
          {settings.tagline} {settings.phone1 && <><span className="text-gold2 mx-2.5">·</span>📞 {settings.phone1}</>}
        </div>
      )}

      <nav className={`bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-[300] transition-shadow duration-300 ${scrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,.09)]' : 'shadow-none'}`}>
        <div className={`max-w-[1280px] mx-auto flex items-center justify-between px-6 md:px-10 transition-[height] duration-300 ${scrolled ? 'h-[60px]' : 'h-[72px]'}`}>
          <Link href="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt={settings.siteName} className={`object-contain flex-shrink-0 transition-all duration-300 ${scrolled ? 'h-9 w-9' : 'h-11 w-11'}`} />
            ) : (
              <div className={`border-2 border-gold rounded-full flex items-center justify-center flex-col flex-shrink-0 transition-all duration-300 ${scrolled ? 'h-9 w-9' : 'h-11 w-11'}`}>
                <div className="font-serif text-[.95rem] font-semibold text-maroon leading-none">BR</div>
              </div>
            )}
            <div>
              <div className="font-serif text-[1.25rem] font-semibold text-maroon tracking-wide leading-none">{settings.siteName}</div>
              <div className="text-[.49rem] tracking-[.24em] uppercase text-muted mt-0.5">{settings.tagline}</div>
            </div>
          </Link>

          <ul className="hidden md:flex gap-7 list-none items-center">
            {LINKS.map(l => {
              const active = pathname === l.href
              return (
                <li key={l.href} className="relative">
                  <Link href={l.href}
                    className={`relative py-1 text-[.67rem] font-semibold tracking-[.16em] uppercase transition-colors group ${active ? 'text-maroon' : 'text-[#555] hover:text-maroon'}`}>
                    {l.label}
                    <span className={`absolute left-0 -bottom-0.5 h-[1.5px] bg-gold transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                </li>
              )
            })}
            <li>
              <Link href="/contact"
                className="inline-block bg-gold text-white text-[.67rem] font-semibold tracking-[.16em] uppercase px-5 py-2.5 rounded transition-all hover:brightness-95 hover:-translate-y-0.5 hover:shadow-md">
                Enquire Now
              </Link>
            </li>
          </ul>

          <button className="md:hidden text-2xl w-9 h-9 flex items-center justify-center" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>{open ? '✕' : '☰'}</motion.span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/40 z-[299]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-white w-64 h-full ml-auto p-6 flex flex-col gap-5"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {LINKS.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                  <Link href={l.href} onClick={() => setOpen(false)}
                    className="text-sm font-semibold uppercase tracking-wider text-ink">{l.label}</Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Link href="/contact" onClick={() => setOpen(false)}
                  className="block bg-gold text-white text-center text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded">
                  Enquire Now
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
