import { notFound, redirect } from 'next/navigation'
import { getVerticalBySlug, getMedia, getActiveTestimonials } from '@/lib/firestore'
import BookingForm from '@/components/sections/BookingForm'
import { VerticalSlug } from '@/types'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const vertical = await getVerticalBySlug(params.slug)
  if (!vertical) return {}
  const description = vertical.tagline || `${vertical.category} in ${vertical.location}`
  return {
    title: vertical.name,
    description,
    alternates: { canonical: `/venues/${vertical.slug}` },
    openGraph: {
      title: vertical.name,
      description,
      images: vertical.coverImageUrl ? [{ url: vertical.coverImageUrl }] : undefined,
    },
  }
}

export default async function VerticalDetailPage({ params }: { params: { slug: string } }) {
  const vertical = await getVerticalBySlug(params.slug)
  if (!vertical) notFound()
  // Verticals with their own separate website send visitors straight there —
  // no internal gallery/booking page is maintained for them in this app.
  if (vertical.externalUrl) redirect(vertical.externalUrl)

  const slug = vertical.slug as VerticalSlug
  const [images, videos, reviews] = await Promise.all([
    getMedia({ section: 'vertical_gallery', verticalSlug: slug, activeOnly: true }),
    getMedia({ section: 'vertical_video', verticalSlug: slug, activeOnly: true }),
    getActiveTestimonials({ verticalSlug: slug }),
  ])

  return (
    <div>
      <div className="relative py-24 px-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${vertical.color}, ${vertical.color}cc)` }}>
        <div className="text-[.7rem] tracking-[.3em] uppercase text-white/70 mb-3">{vertical.category}</div>
        <h1 className="font-serif text-[clamp(30px,4.5vw,48px)] font-light mb-3">{vertical.icon} {vertical.name}</h1>
        <div className="text-sm text-white/80">
          📍 {vertical.location}
          {vertical.status === 'draft' && <span className="ml-3 bg-amber-500/80 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">Coming Soon</span>}
        </div>
      </div>

      {images.length > 0 && (
        <div className={`grid gap-1 overflow-hidden ${
          images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
        }`}>
          {images.slice(0, 5).map(img => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.id} src={img.url} alt={img.caption || vertical.name}
              className="w-full aspect-[4/3] md:aspect-[16/10] object-cover" />
          ))}
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12">
        <div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {vertical.highlights.map((h, i) => (
              <div key={i} className="bg-cream2 border border-border rounded-lg py-4 text-center">
                <div className="font-serif text-xl font-semibold" style={{ color: vertical.color }}>{h.value}</div>
                <div className="text-[.62rem] text-muted uppercase tracking-wider mt-1">{h.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="text-[.65rem] font-bold uppercase tracking-[.16em] text-muted mb-2.5">About</div>
            {vertical.about.split('\n\n').map((p, i) => (
              <p key={i} className="text-[.85rem] leading-relaxed text-muted mb-3">{p}</p>
            ))}
          </div>

          {vertical.amenities.length > 0 && (
            <div className="mb-8">
              <div className="text-[.65rem] font-bold uppercase tracking-[.16em] text-muted mb-2.5">Amenities</div>
              <div className="flex flex-wrap gap-2">
                {vertical.amenities.map((a, i) => (
                  <span key={i} className="bg-cream2 border border-border rounded-full px-3.5 py-1.5 text-[.74rem]">{a}</span>
                ))}
              </div>
            </div>
          )}

          {images.length > 5 && (
            <div className="mb-8">
              <div className="text-[.65rem] font-bold uppercase tracking-[.16em] text-muted mb-2.5">Gallery</div>
              <div className="grid grid-cols-3 gap-2">
                {images.map(img => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={img.id} src={img.url} alt={img.caption || vertical.name} className="aspect-square object-cover rounded-md" />
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className="mb-8">
              <div className="text-[.65rem] font-bold uppercase tracking-[.16em] text-muted mb-2.5">Videos</div>
              <div className="grid grid-cols-2 gap-3">
                {videos.map(v => (
                  <video key={v.id} src={v.url} controls className="w-full rounded-md aspect-video object-cover" />
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div>
              <div className="text-[.65rem] font-bold uppercase tracking-[.16em] text-muted mb-2.5">Guest Reviews</div>
              <div className="flex flex-col gap-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-cream2 border border-border rounded-lg p-4">
                    <div className="text-gold text-sm mb-1.5">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    <div className="text-[.78rem] text-muted italic mb-2">&quot;{r.quote}&quot;</div>
                    <div className="text-[.72rem] font-semibold">{r.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24">
            <BookingForm verticalSlug={slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
