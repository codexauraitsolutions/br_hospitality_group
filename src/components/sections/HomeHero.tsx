'use client'
import Link from 'next/link'
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Vertical } from '@/types'

export default function HomeHero({ verticals }: { verticals: Vertical[] }) {
  return (
    <div id="verticals" className="max-w-[1320px] mx-auto px-6 md:px-10 pt-20 pb-6 scroll-mt-20">
      <Reveal className="text-center mb-12" direction="none">
        <div className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-3">Welcome to</div>
        <div className="font-serif text-[clamp(28px,4vw,44px)] font-light">
          <strong className="font-semibold">BR Hospitality Group</strong> — Our Verticals
        </div>
        <div className="w-14 h-0.5 bg-gold mx-auto mt-5" />
      </Reveal>

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {verticals.map(v => {
          const isExternal = !!v.externalUrl
          const linkProps = isExternal
            ? { href: v.externalUrl, target: '_blank', rel: 'noopener noreferrer' }
            : { href: `/venues/${v.slug}` }
          return (
            <StaggerItem key={v.slug}>
              <Link {...linkProps}
                className="group relative block aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_24px_50px_-16px_rgba(0,0,0,0.4)] hover:-translate-y-1.5">
                {v.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.coverImageUrl} alt={v.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl transition-transform duration-700 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${v.color}, ${v.color}cc)` }}>
                    <span className="opacity-90">{v.icon}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="text-[.6rem] tracking-[.16em] uppercase text-white/85 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
                    {v.category}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="font-serif font-semibold text-white mb-1 text-lg">{v.name}</div>
                  <div className="text-[.74rem] text-white/70 mb-2.5">📍 {v.location}</div>
                  <div className="flex items-center gap-1.5 text-[.62rem] tracking-[.16em] uppercase text-gold2 font-semibold opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {isExternal ? 'Visit Website' : 'Book Now'} <span aria-hidden>→</span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          )
        })}
      </Stagger>
    </div>
  )
}
