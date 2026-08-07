'use client'
import { useState } from 'react'
import { MediaItem, Vertical } from '@/types'

export default function GalleryGrid({ media, verticals }: { media: MediaItem[]; verticals: Vertical[] }) {
  const [filter, setFilter] = useState<string>('all')

  const items = filter === 'all' ? media : media.filter(m => m.verticalSlug === filter)

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button onClick={() => setFilter('all')}
          className={`text-[.68rem] font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-colors ${filter === 'all' ? 'bg-maroon text-white border-maroon' : 'border-border text-muted hover:border-maroon'}`}>
          All Venues
        </button>
        {verticals.map(v => (
          <button key={v.slug} onClick={() => setFilter(v.slug)}
            className={`text-[.68rem] font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-colors ${filter === v.slug ? 'bg-maroon text-white border-maroon' : 'border-border text-muted hover:border-maroon'}`}>
            {v.icon} {v.short}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted text-sm">
          No photos uploaded yet{filter !== 'all' ? ' for this venue' : ''} — check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(m => (
            <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-cream2 group">
              {m.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.caption || m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" muted />
              )}
              {m.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-[.72rem]">
                  {m.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
