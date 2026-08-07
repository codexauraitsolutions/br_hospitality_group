import Link from 'next/link'
import { Vertical } from '@/types'

export default function HomeHero({ verticals }: { verticals: Vertical[] }) {
  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-14 pb-4">
      <div className="text-center mb-10">
        <div className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-3">Welcome to</div>
        <div className="font-serif text-[clamp(28px,4vw,44px)] font-light">
          <strong className="font-semibold">BR Hospitality Group</strong> — Our Verticals
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {verticals.map(v => {
          const isExternal = !!v.externalUrl
          const linkProps = isExternal
            ? { href: v.externalUrl, target: '_blank', rel: 'noopener noreferrer' }
            : { href: `/venues/${v.slug}` }
          return (
            <Link key={v.slug} {...linkProps}
              className="group block bg-cream2 border border-border rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
              {v.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.coverImageUrl} alt={v.name} className="w-full aspect-video object-cover" />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, ${v.color}, ${v.color}cc)` }}>
                  <span className="opacity-90">{v.icon}</span>
                </div>
              )}
              <div className="p-6">
                <div className="font-serif text-lg font-semibold mb-1" style={{ color: v.color }}>{v.name}</div>
                <div className="text-[.72rem] text-muted mb-1">📍 {v.location}</div>
                <div className="text-[.68rem] text-muted mb-3">{v.category}</div>
                <div className="text-[.58rem] tracking-[.18em] uppercase text-gold font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {isExternal ? 'Visit Website →' : 'Book Now →'}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
