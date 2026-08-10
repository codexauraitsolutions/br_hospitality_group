import type { Metadata } from 'next'
import { getSiteSettings, getTeamMembers, getVerticals } from '@/lib/firestore'
import IconCardGrid from '@/components/sections/IconCardGrid'
import StatsBand from '@/components/sections/StatsBand'
import FounderPhoto from '@/components/sections/FounderPhoto'
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal'
import Link from 'next/link'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about BR Hospitality Group — 30+ years running premium restaurants, convention centres, resorts, farm stays and catering across Hyderabad.',
  alternates: { canonical: '/about' },
}

export default async function AboutPage() {
  const [settings, team, verticals] = await Promise.all([getSiteSettings(), getTeamMembers(), getVerticals({ onlyLive: true })])

  const stats = [
    { value: settings.aboutStats.founded, label: 'Founded' },
    { value: String(verticals.length), label: 'Venues' },
    { value: settings.aboutStats.guests, label: 'Happy Guests' },
    { value: settings.aboutStats.eventsPerYear, label: 'Events Per Year' },
  ]

  const founder = team.find(m => /founder/i.test(m.role))
  const restTeam = founder ? team.filter(m => m.id !== founder.id) : team

  return (
    <div>
      <div className="relative bg-gradient-to-br from-maroon to-maroon2 text-white text-center py-20 px-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, white 0, transparent 35%), radial-gradient(circle at 85% 75%, white 0, transparent 35%)' }} />
        <Reveal className="relative" direction="none">
          <div className="text-[.7rem] tracking-[.3em] uppercase text-gold2 mb-3">Our Story</div>
          <h1 className="font-serif text-[clamp(30px,4.5vw,48px)] font-light mb-4">About {settings.siteName}</h1>
          <p className="max-w-xl mx-auto text-white/70 text-sm leading-relaxed">
            A legacy of warmth, celebration and unforgettable experiences — built across {settings.aboutStats.founded && `${new Date().getFullYear() - Number(settings.aboutStats.founded)} years`} and {verticals.length} extraordinary venues in Hyderabad.
          </p>
        </Reveal>
      </div>

      <div className="max-w-[760px] mx-auto px-6 py-16 text-center">
        <Reveal>
          <div className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-2">Who We Are</div>
          <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-light mb-4">{settings.aboutIntroTitle}</h2>
          <div className="w-10 h-0.5 bg-gold mx-auto mb-5" />
          <p className="text-[.85rem] leading-relaxed text-muted mb-4">{settings.aboutIntroText1}</p>
          <p className="text-[.85rem] leading-relaxed text-muted mb-6">{settings.aboutIntroText2}</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link href="/contact" className="inline-block bg-gold text-white text-[.7rem] font-semibold uppercase tracking-wider px-5 py-3 rounded transition-all hover:-translate-y-0.5 hover:shadow-md">Enquire Now →</Link>
            <Link href="/" className="inline-block border border-border text-ink text-[.7rem] font-semibold uppercase tracking-wider px-5 py-3 rounded transition-all hover:-translate-y-0.5 hover:border-maroon">Our Brands →</Link>
          </div>
        </Reveal>
      </div>

      {founder && (
        <div className="relative bg-gradient-to-br from-maroon to-maroon2 py-20 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, #c9a84c 0, transparent 35%), radial-gradient(circle at 10% 85%, white 0, transparent 30%)' }} />
          <div className="relative max-w-[1050px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[minmax(0,340px)_1fr] gap-12 items-center">
            <Reveal direction="left">
              <div className="relative mx-auto md:mx-0 w-full max-w-[320px]">
                <div className="absolute -inset-3 border border-gold2/40 rounded-2xl" />
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_30px_60px_-16px_rgba(0,0,0,0.5)] border-4 border-white">
                  <FounderPhoto photoUrl={founder.photoUrl} name={founder.name} />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gold text-white text-[.62rem] font-semibold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                  30+ Years of Leadership
                </div>
              </div>
            </Reveal>
            <Reveal direction="right" delay={0.1}>
              <div className="font-serif text-6xl text-gold2/30 leading-none mb-2 select-none">&ldquo;</div>
              <div className="text-[.72rem] tracking-[.3em] uppercase text-gold2 font-semibold mb-2 -mt-4">Meet Our Founder</div>
              <div className="font-serif text-[clamp(28px,3.5vw,40px)] font-light text-white mb-1">{founder.name}</div>
              <div className="text-[.74rem] text-gold2 uppercase tracking-wider font-semibold mb-5">{founder.role}</div>
              {founder.bio.split('\n\n').map((p, i) => (
                <p key={i} className="text-[.87rem] leading-relaxed text-white/75 mb-3 last:mb-0">{p}</p>
              ))}
            </Reveal>
          </div>
        </div>
      )}

      <IconCardGrid eyebrow="Our Values" title={<>The Principles That <strong className="italic font-normal">Drive Us</strong></>} items={settings.values} />

      <StatsBand stats={stats} />

      {restTeam.length > 0 && (
        <div className="py-16">
          <div className="max-w-[1000px] mx-auto px-6 text-center">
            <Reveal>
              <div className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-2">Our Team</div>
              <div className="font-serif text-[clamp(24px,3vw,34px)] font-light mb-10">The People Behind <strong className="italic font-normal">Every Memory</strong></div>
            </Reveal>
            <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {restTeam.map(m => (
                <StaggerItem key={m.id}>
                  <div className="bg-cream2 border border-border rounded-lg p-6 h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                    {m.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photoUrl} alt={m.name} className="w-16 h-16 rounded-full object-cover mb-3" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl mb-3">👤</div>
                    )}
                    <div className="font-serif text-[1.05rem] font-semibold text-maroon mb-1">{m.name}</div>
                    <div className="text-[.68rem] text-gold uppercase tracking-wider font-semibold mb-2.5">{m.role}</div>
                    <div className="text-[.76rem] text-muted leading-relaxed">{m.bio}</div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      )}

      <div className="bg-cream2 border-t border-border py-14 text-center px-6">
        <Reveal>
          <div className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-2">Get In Touch</div>
          <div className="font-serif text-[clamp(22px,3vw,30px)] font-light mb-4">Ready to Plan Your <strong className="font-semibold">Next Event?</strong></div>
          <p className="text-[.8rem] text-muted max-w-md mx-auto mb-6">Let us help you create an unforgettable experience. Our team is ready to assist you.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact" className="inline-block bg-gold text-white text-[.7rem] font-semibold uppercase tracking-wider px-5 py-3 rounded transition-all hover:-translate-y-0.5 hover:shadow-md">Contact Us →</Link>
            <Link href="/" className="inline-block border border-border text-ink text-[.7rem] font-semibold uppercase tracking-wider px-5 py-3 rounded transition-all hover:-translate-y-0.5 hover:border-maroon">Explore Venues →</Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
