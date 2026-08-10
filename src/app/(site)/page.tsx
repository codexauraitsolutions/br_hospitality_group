import { getSiteSettings, getVerticals, getActiveTestimonials, getMedia } from '@/lib/firestore'
import HeroSlideshow from '@/components/sections/HeroSlideshow'
import HomeHero from '@/components/sections/HomeHero'
import ServicesStrip from '@/components/sections/ServicesStrip'
import IconCardGrid from '@/components/sections/IconCardGrid'
import StatsBand from '@/components/sections/StatsBand'
import TestimonialsGrid from '@/components/sections/TestimonialsGrid'
import Reveal from '@/components/motion/Reveal'

export const revalidate = 60

export default async function HomePage() {
  const [settings, verticals, testimonials, banners] = await Promise.all([
    getSiteSettings(),
    getVerticals({ onlyLive: true }),
    getActiveTestimonials({ homeOnly: true }),
    getMedia({ section: 'banner', activeOnly: true }),
  ])

  // Venue count always reflects the actual live verticals — not a manually-typed
  // number that goes stale the moment a vertical is added or deactivated.
  const stats = [
    { value: settings.homeStats.years, label: 'Years of Excellence' },
    { value: settings.homeStats.guests, label: 'Happy Guests' },
    { value: String(verticals.length), label: 'Premium Venues' },
    { value: settings.homeStats.maxGuests, label: 'Max Guests Catered' },
  ]

  // Prefer admin-uploaded homepage banners; fall back to venue cover photos so the
  // hero still looks fully designed even before anyone uploads a dedicated banner.
  const heroImages = (banners.length > 0 ? banners.map(b => b.url) : verticals.map(v => v.coverImageUrl).filter(Boolean)).slice(0, 6)

  return (
    <div>
      {settings.toggles.showSlideshow && heroImages.length > 0 && (
        <div className="-mt-[72px] relative z-[100]">
          <HeroSlideshow settings={settings} images={heroImages} venueCount={verticals.length} />
        </div>
      )}
      {settings.toggles.showBrandCards && <HomeHero verticals={verticals} />}
      <ServicesStrip items={settings.servicesStrip} />
      {settings.toggles.showWhyChooseUs && (
        <IconCardGrid eyebrow="Why Choose Us" title={<>Why Families &amp; Corporates <strong className="italic font-normal">Choose Us</strong></>} items={settings.whyChooseUs} />
      )}
      <StatsBand stats={stats} />
      {settings.toggles.showReviews && <TestimonialsGrid testimonials={testimonials} />}
      {settings.taglineband && (
        <div className="relative bg-gradient-to-br from-gold2/25 via-gold2/15 to-cream py-12 text-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #c9a84c 0, transparent 40%), radial-gradient(circle at 75% 50%, #1a2d5a 0, transparent 40%)' }} />
          <Reveal className="relative">
            <p className="font-serif text-[clamp(18px,2.2vw,26px)] italic text-maroon">{settings.taglineband}</p>
          </Reveal>
        </div>
      )}
    </div>
  )
}
