'use client'
import { useState } from 'react'
import { MediaItem } from '@/types'
import Lightbox from '@/components/motion/Lightbox'

/** Top image strip shows the first 4 photos; the "Gallery" grid below shows the rest
 * (not a repeat of the strip). Both open the same lightbox with arrow navigation across
 * every photo for this venue.
 * The strip always shows a multiple of 4 (or fewer than 4) so the grid fills completely —
 * at 2 cols (mobile) or 4 cols (desktop), 5 items leaves a lonely last row with a gap. */
export default function VenueGallery({ images, venueName }: { images: MediaItem[]; venueName: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  const strip = images.slice(0, 4)
  const rest = images.slice(4)

  return (
    <>
      <div className={`grid gap-1 overflow-hidden ${
        strip.length === 1 ? 'grid-cols-1' : strip.length === 2 ? 'grid-cols-2' : strip.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
      }`}>
        {strip.map((img, i) => (
          <button key={img.id} onClick={() => setActiveIndex(i)} className="overflow-hidden cursor-zoom-in block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption || venueName} loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
              className="w-full aspect-[4/3] md:aspect-[16/10] object-cover transition-transform duration-700 hover:scale-105" />
          </button>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mb-8">
          <div className="text-[.65rem] font-bold uppercase tracking-[.16em] text-muted mb-2.5">Gallery</div>
          <div className="grid grid-cols-3 gap-2">
            {rest.map((img, i) => (
              <button key={img.id} onClick={() => setActiveIndex(i + 4)} className="overflow-hidden rounded-md cursor-zoom-in block w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || venueName} loading="lazy" decoding="async" className="aspect-square object-cover transition-transform duration-500 hover:scale-110" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Lightbox items={images} index={activeIndex} onClose={() => setActiveIndex(null)} onNav={setActiveIndex} />
    </>
  )
}
