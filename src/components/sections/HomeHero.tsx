'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Vertical } from '@/types'

export default function HomeHero({ verticals }: { verticals: Vertical[] }) {
  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-14 pb-4">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          Welcome to
        </motion.div>
        <div className="font-serif text-[clamp(28px,4vw,44px)] font-light">
          <strong className="font-semibold">BR Hospitality Group</strong> — Our Verticals
        </div>
      </motion.div>

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {verticals.map(v => {
          const isExternal = !!v.externalUrl
          const linkProps = isExternal
            ? { href: v.externalUrl, target: '_blank', rel: 'noopener noreferrer' }
            : { href: `/venues/${v.slug}` }
          return (
            <StaggerItem key={v.slug}>
              <Link {...linkProps}
                className="group block bg-cream2 border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_18px_40px_-12px_rgba(26,45,90,0.25)] hover:-translate-y-1.5 hover:border-gold/50">
                <div className="overflow-hidden">
                  {v.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.coverImageUrl} alt={v.name} className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full aspect-video flex items-center justify-center text-4xl transition-transform duration-500 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${v.color}, ${v.color}cc)` }}>
                      <span className="opacity-90">{v.icon}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="font-serif text-lg font-semibold mb-1" style={{ color: v.color }}>{v.name}</div>
                  <div className="text-[.72rem] text-muted mb-1">📍 {v.location}</div>
                  <div className="text-[.68rem] text-muted mb-3">{v.category}</div>
                  <div className="text-[.58rem] tracking-[.18em] uppercase text-gold font-semibold opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    {isExternal ? 'Visit Website →' : 'Book Now →'}
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
