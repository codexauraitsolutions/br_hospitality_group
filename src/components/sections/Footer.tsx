import Link from 'next/link'
import { SiteSettings, Vertical } from '@/types'

export default function Footer({ settings, verticals }: { settings: SiteSettings; verticals: Vertical[] }) {
  return (
    <footer className="bg-[#1a1712] text-white/70">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          {settings.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoUrl} alt={settings.siteName} className="h-10 object-contain mb-3" />
          )}
          <div className="font-serif text-xl font-semibold text-white mb-3">{settings.siteName}</div>
          <p className="text-[.78rem] leading-relaxed text-white/50 mb-5">{settings.tagline}</p>
          <Link href="/contact" className="inline-block bg-gold text-white text-[.7rem] font-semibold uppercase tracking-wider px-4 py-2.5 rounded">
            Contact Us →
          </Link>
        </div>

        <div>
          <div className="text-[.68rem] font-bold uppercase tracking-[.18em] text-gold2 mb-4">Our Brands</div>
          <ul className="flex flex-col gap-2">
            {verticals.map(v => (
              <li key={v.slug}>
                <Link href={`/venues/${v.slug}`} className="text-[.78rem] text-white/55 hover:text-white transition-colors">{v.short}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[.68rem] font-bold uppercase tracking-[.18em] text-gold2 mb-4">Quick Links</div>
          <ul className="flex flex-col gap-2">
            <li><Link href="/" className="text-[.78rem] text-white/55 hover:text-white">Home</Link></li>
            <li><Link href="/about" className="text-[.78rem] text-white/55 hover:text-white">About</Link></li>
            <li><Link href="/gallery" className="text-[.78rem] text-white/55 hover:text-white">Gallery</Link></li>
            <li><Link href="/contact" className="text-[.78rem] text-white/55 hover:text-white">Contact</Link></li>
            <li><Link href="/login" className="text-[.78rem] text-white/55 hover:text-white">Admin Panel</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-[.68rem] font-bold uppercase tracking-[.18em] text-gold2 mb-4">Contact</div>
          <ul className="flex flex-col gap-2.5 text-[.78rem] text-white/55">
            {settings.address && <li>📍 {settings.address}</li>}
            {settings.phone1 && <li>📞 {settings.phone1}</li>}
            {settings.email && <li>✉ {settings.email}</li>}
            {settings.whatsapp && <li>💬 WhatsApp: {settings.whatsapp}</li>}
          </ul>
          {(settings.instagram || settings.facebook || settings.youtube) && (
            <div className="mt-5">
              <div className="text-[.68rem] font-bold uppercase tracking-[.18em] text-gold2 mb-3">Follow Us</div>
              <div className="flex gap-3 text-[.78rem]">
                {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-white">Instagram</a>}
                {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-white">Facebook</a>}
                {settings.youtube && <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-white/55 hover:text-white">YouTube</a>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-[.68rem] text-white/35">
        © {new Date().getFullYear()} {settings.siteName} · All Rights Reserved
      </div>
    </footer>
  )
}
