'use client'
import { usePathname } from 'next/navigation'

export default function WhatsAppFloat({ whatsapp }: { whatsapp: string }) {
  const pathname = usePathname()
  if (!whatsapp) return null

  const onVenuePage = pathname.startsWith('/venues/')
  const text = onVenuePage
    ? `Hi! I'd like to know more about ${decodeURIComponent(pathname.split('/').pop() || '')}.`
    : "Hi! I'd like to know more about BR Hospitality Group."

  const href = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`

  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[400] w-14 h-14 rounded-full bg-[#25d366] shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform">
      💬
    </a>
  )
}
