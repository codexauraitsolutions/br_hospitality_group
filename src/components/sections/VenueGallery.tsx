'use client'
import { useState } from 'react'
import { MediaItem } from '@/types'
import Lightbox from '@/components/motion/Lightbox'

/** Single full-bleed photo grid right under the hero — every photo for this venue, no
 * split, no repeats, no section heading. Responsive column count (2/3/4) so the grid
 * always fills cleanly with no lonely last-row gap at any breakpoint. */
export default function VenueGallery({ images, venueName }: { images: MediaItem[]; venueName: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 overflow-hidden">
        {images.map((img, i) => (
          <button key={img.id} onClick={() => setActiveIndex(i)} className="overflow-hidden cursor-zoom-in block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption || venueName} loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
              className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-110" />
          </button>
        ))}
      </div>

      <Lightbox items={images} index={activeIndex} onClose={() => setActiveIndex(null)} onNav={setActiveIndex} />
    </>
  )
}
