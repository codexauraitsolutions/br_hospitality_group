import Link from 'next/link'
import { getSiteSettings, getVerticals } from '@/lib/firestore'
import ContactForm from '@/components/sections/ContactForm'

export const revalidate = 60

export default async function ContactPage() {
  const [settings, verticals] = await Promise.all([getSiteSettings(), getVerticals({ onlyLive: true })])

  return (
    <div>
      <div className="bg-gradient-to-br from-maroon to-maroon2 text-white text-center py-20 px-6">
        <div className="text-[.7rem] tracking-[.3em] uppercase text-gold2 mb-3">Get In Touch</div>
        <h1 className="font-serif text-[clamp(30px,4.5vw,48px)] font-light mb-4">Contact Us</h1>
        <p className="max-w-xl mx-auto text-white/70 text-sm leading-relaxed">
          We&apos;d love to hear from you. Reach out for bookings, enquiries or just to say hello!
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-12">
        <div>
          <div className="bg-cream2 border border-border rounded-lg p-6 mb-6">
            <div className="font-serif text-lg font-semibold mb-5">Contact Information</div>
            {settings.address && (
              <div className="flex gap-3 mb-4"><div className="text-lg">📍</div>
                <div><div className="text-[.62rem] text-muted uppercase tracking-wider">Head Office</div><div className="text-[.82rem]">{settings.siteName}<br />{settings.address}</div></div>
              </div>
            )}
            {settings.phone1 && (
              <div className="flex gap-3 mb-4"><div className="text-lg">📞</div>
                <div><div className="text-[.62rem] text-muted uppercase tracking-wider">Phone</div><div className="text-[.82rem]">{settings.phone1}{settings.phone2 && <><br />{settings.phone2}</>}</div></div>
              </div>
            )}
            {settings.email && (
              <div className="flex gap-3 mb-4"><div className="text-lg">✉</div>
                <div><div className="text-[.62rem] text-muted uppercase tracking-wider">Email</div><div className="text-[.82rem]">{settings.email}</div></div>
              </div>
            )}
            {settings.whatsapp && (
              <div className="flex gap-3"><div className="text-lg">💬</div>
                <div><div className="text-[.62rem] text-muted uppercase tracking-wider">WhatsApp</div><div className="text-[.82rem]">{settings.whatsapp}</div></div>
              </div>
            )}
          </div>

          {settings.mapsEmbedUrl ? (
            <iframe src={settings.mapsEmbedUrl} className="w-full h-64 rounded-lg border-0" loading="lazy" />
          ) : (
            <div className="bg-cream2 border border-border rounded-lg h-48 flex flex-col items-center justify-center text-muted text-sm gap-2">
              <div className="text-3xl opacity-30">🗺️</div>
              <div>Map coming soon</div>
            </div>
          )}

          {verticals.length > 0 && (
            <div className="mt-8">
              <div className="text-[.68rem] font-bold uppercase tracking-wider text-muted mb-3">Our Venues</div>
              <div className="flex flex-col gap-2">
                {verticals.map(v => (
                  <Link key={v.slug} href={v.externalUrl || `/venues/${v.slug}`}
                    {...(v.externalUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center justify-between border border-border rounded-lg px-4 py-2.5 hover:border-gold transition-colors">
                    <span className="text-[.78rem]">{v.icon} {v.short}</span>
                    <span className="text-[.62rem] text-gold uppercase tracking-wider">{v.externalUrl ? 'Visit →' : 'Book Now →'}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <ContactForm verticals={verticals} />
        </div>
      </div>
    </div>
  )
}
