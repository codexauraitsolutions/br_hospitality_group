'use client'
import { motion } from 'framer-motion'
import { SiteSettings } from '@/types'

export default function FloatingActionBar({ settings }: { settings: SiteSettings }) {
  const actions = [
    settings.phone1 && { icon: '📞', label: 'Call', href: `tel:${settings.phone1}` },
    settings.whatsapp && { icon: '💬', label: 'WhatsApp', href: `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hi! I'd like to know more about BR Hospitality Group.")}` },
    { icon: '📅', label: 'Enquire', href: '/contact' },
    settings.address && { icon: '📍', label: 'Location', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}` },
  ].filter(Boolean) as { icon: string; label: string; href: string }[]

  if (!actions.length) return null

  return (
    <motion.div
      className="fixed bottom-0 inset-x-0 z-[350] px-3 pb-3 md:bottom-5 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:px-0 md:pb-0"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-maroon/95 backdrop-blur-md rounded-2xl md:rounded-full shadow-[0_10px_40px_-8px_rgba(0,0,0,0.4)] px-1.5 py-1.5 flex gap-1">
        {actions.map((a, i) => (
          <a
            key={i}
            href={a.href}
            target={a.href.startsWith('http') ? '_blank' : undefined}
            rel={a.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl md:rounded-full px-3 md:px-5 py-2 transition-colors"
          >
            <span className="text-base md:text-[.85rem]">{a.icon}</span>
            <span className="text-[.6rem] md:text-[.7rem] font-semibold uppercase tracking-wider">{a.label}</span>
          </a>
        ))}
      </div>
    </motion.div>
  )
}
