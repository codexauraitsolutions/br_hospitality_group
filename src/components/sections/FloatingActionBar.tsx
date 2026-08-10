'use client'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { SiteSettings } from '@/types'

export default function FloatingActionBar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname()
  if (!settings.whatsapp) return null

  const onVenuePage = pathname.startsWith('/venues/')
  const text = onVenuePage
    ? `Hi! I'd like to know more about ${decodeURIComponent(pathname.split('/').pop() || '')}.`
    : "Hi! I'd like to know more about BR Hospitality Group."
  const href = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 right-4 md:right-6 z-[350] w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25d366] shadow-lg flex items-center justify-center text-2xl md:text-[1.7rem]"
    >
      💬
    </motion.a>
  )
}
