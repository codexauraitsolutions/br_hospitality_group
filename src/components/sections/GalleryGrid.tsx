'use client'
import { useState } from 'react'
import { MediaItem, Vertical } from '@/types'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import Lightbox from '@/components/motion/Lightbox'

export default function GalleryGrid({ media, verticals }: { media: MediaItem[]; verticals: Vertical[] }) {
  const [filter, setFilter] = useState<string>('all')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const items = filter === 'all' ? media : media.filter(m => m.verticalSlug === filter)

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button onClick={() => { setFilter('all'); setActiveIndex(null) }}
          className={`text-[.68rem] font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${filter === 'all' ? 'bg-maroon text-white border-maroon' : 'border-border text-muted hover:border-maroon'}`}>
          All Venues
        </button>
        {verticals.map(v => (
          <button key={v.slug} onClick={() => { setFilter(v.slug); setActiveIndex(null) }}
            className={`text-[.68rem] font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${filter === v.slug ? 'bg-maroon text-white border-maroon' : 'border-border text-muted hover:border-maroon'}`}>
            {v.icon} {v.short}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">
          No photos uploaded yet{filter !== 'all' ? ' for this venue' : ''} — check back soon.
        </div>
      ) : (
        <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" stagger={0.04}>
          {items.map((m, i) => (
            <StaggerItem key={m.id} y={16}>
              <button
                onClick={() => setActiveIndex(i)}
                className="relative aspect-square rounded-lg overflow-hidden bg-cream2 group w-full block cursor-zoom-in"
              >
                {m.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.caption || m.filename} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <video src={m.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" muted />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">🔍</span>
                </div>
                {m.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-[.72rem] text-left">
                    {m.caption}
                  </div>
                )}
              </button>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <Lightbox items={items} index={activeIndex} onClose={() => setActiveIndex(null)} onNav={setActiveIndex} />
    </div>
  )
}
