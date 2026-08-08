import type { Metadata } from 'next'
import { getVerticals, getMedia } from '@/lib/firestore'
import GalleryGrid from '@/components/sections/GalleryGrid'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse photos from BR Hospitality Group’s restaurants, convention halls, resorts and farm stays across Hyderabad.',
  alternates: { canonical: '/gallery' },
}

export default async function GalleryPage() {
  const [verticals, media] = await Promise.all([
    getVerticals({ onlyLive: true }),
    getMedia({ section: 'vertical_gallery', activeOnly: true }),
  ])

  return (
    <div>
      <div className="bg-gradient-to-br from-maroon to-maroon2 text-white text-center py-20 px-6">
        <div className="text-[.7rem] tracking-[.3em] uppercase text-gold2 mb-3">Our Gallery</div>
        <h1 className="font-serif text-[clamp(30px,4.5vw,48px)] font-light mb-4">Moments Worth Remembering</h1>
        <p className="max-w-xl mx-auto text-white/70 text-sm leading-relaxed">
          A glimpse into the celebrations, stays and experiences across all seven of our venues.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <GalleryGrid media={media} verticals={verticals} />
      </div>
    </div>
  )
}
