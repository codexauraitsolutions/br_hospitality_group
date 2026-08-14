'use client'
import { useState } from 'react'
import { MediaItem } from '@/types'
import Lightbox from '@/components/motion/Lightbox'

/** Top image strip right under the hero, plus the full "Gallery" grid further down the
 * page (shown only when there are more than 5 photos) — both open the same lightbox
 * with arrow navigation across every photo for this venue. */
export default function VenueGallery({ images, venueName }: { images: MediaItem[]; venueName: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      <div className={`grid gap-1 overflow-hidden ${
        images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
      }`}>
        {images.slice(0, 5).map((img, i) => (
          <button key={img.id} onClick={() => setActiveIndex(i)} className="overflow-hidden cursor-zoom-in block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption || venueName} loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
              className="w-full aspect-[4/3] md:aspect-[16/10] object-cover transition-transform duration-700 hover:scale-105" />
          </button>
        ))}
      </div>

      {images.length > 5 && (
        <div className="mb-8">
          <div className="text-[.65rem] font-bold uppercase tracking-[.16em] text-muted mb-2.5">Gallery</div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <button key={img.id} onClick={() => setActiveIndex(i)} className="overflow-hidden rounded-md cursor-zoom-in block w-full">
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
