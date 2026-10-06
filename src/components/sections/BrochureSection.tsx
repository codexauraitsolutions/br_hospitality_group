'use client'
import { useState } from 'react'
import { MediaItem } from '@/types'
import Reveal from '@/components/motion/Reveal'
import Lightbox from '@/components/motion/Lightbox'

const PDF_URL = '/brochure/br-hospitality-group-brochure.pdf'

/** The client's printed pamphlet, split into its two panels. Thumbnails load with the
 * page; the full-resolution scans are only fetched when someone opens the lightbox. */
const PANELS = [
  {
    key: 'pbr-prime',
    label: 'Hotel PBR Prime',
    blurb: 'Family restaurant, banquets, private dining & outdoor catering',
    thumb: '/brochure/pamphlet-pbr-prime-thumb.webp',
    full: '/brochure/pamphlet-pbr-prime.webp',
  },
  {
    key: 'venues',
    label: 'Our Venues',
    blurb: 'KMS Convention, Lush Castle Resort & Jaya Convention',
    thumb: '/brochure/pamphlet-venues-thumb.webp',
    full: '/brochure/pamphlet-venues.webp',
  },
]

// Lightbox is built around the CMS MediaItem shape, so present the panels as such
// rather than forking a second viewer.
const LIGHTBOX_ITEMS = PANELS.map((p, i): MediaItem => ({
  id: p.key,
  section: 'banner',
  verticalSlug: null,
  s3Key: '',
  url: p.full,
  type: 'image',
  filename: `${p.key}.webp`,
  size: 0,
  caption: p.label,
  sortOrder: i,
  active: true,
  createdAt: '',
}))

export default function BrochureSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="bg-cream2 border-t border-border">
      <div className="max-w-[1100px] mx-auto px-6 py-16">
        <Reveal className="text-center mb-10" direction="none">
          <div className="text-[.7rem] tracking-[.3em] uppercase text-gold mb-3">Brochure</div>
          <h2 className="font-serif text-[clamp(26px,3.5vw,38px)] font-light mb-3">Our Pamphlet</h2>
          <p className="max-w-xl mx-auto text-muted text-sm leading-relaxed">
            Everything the group offers on a single sheet — tap either side to read it full screen,
            or download the printable copy.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PANELS.map((p, i) => (
            <Reveal key={p.key} direction={i === 0 ? 'left' : 'right'} delay={i * 0.1}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`View ${p.label} panel full screen`}
                className="group w-full text-left bg-white border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-gold hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative overflow-hidden bg-cream2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumb}
                    alt={`${p.label} — BR Hospitality Group pamphlet`}
                    width={900}
                    height={1272}
                    loading="lazy"
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/10 transition-colors duration-300" />
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-[.6rem] tracking-[.15em] uppercase text-maroon rounded px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to enlarge
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="font-serif text-base font-semibold">{p.label}</div>
                  <div className="text-[.7rem] text-muted mt-0.5 leading-relaxed">{p.blurb}</div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-9" delay={0.2}>
          <a
            href={PDF_URL}
            download
            className="inline-flex items-center gap-2.5 bg-gradient-to-br from-maroon to-maroon2 text-white text-[.72rem] tracking-[.15em] uppercase rounded-lg px-7 py-3.5 transition-transform hover:-translate-y-0.5 active:scale-[.98]"
          >
            <span aria-hidden="true">⬇</span> Download Brochure
            <span className="text-white/50 normal-case tracking-normal text-[.68rem]">PDF · 1 MB</span>
          </a>
        </Reveal>
      </div>

      <Lightbox items={LIGHTBOX_ITEMS} index={open} onClose={() => setOpen(null)} onNav={setOpen} />
    </div>
  )
}
