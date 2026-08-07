import { getSiteSettings, getVerticals, getActiveTestimonials } from '@/lib/firestore'
import HomeHero from '@/components/sections/HomeHero'
import ServicesStrip from '@/components/sections/ServicesStrip'
import IconCardGrid from '@/components/sections/IconCardGrid'
import StatsBand from '@/components/sections/StatsBand'
import TestimonialsGrid from '@/components/sections/TestimonialsGrid'

export const revalidate = 60

export default async function HomePage() {
  const [settings, verticals, testimonials] = await Promise.all([
    getSiteSettings(),
    getVerticals({ onlyLive: true }),
    getActiveTestimonials({ homeOnly: true }),
  ])

  const stats = [
    { value: settings.homeStats.years, label: 'Years of Excellence' },
    { value: settings.homeStats.guests, label: 'Happy Guests' },
    { value: settings.homeStats.venues, label: 'Premium Venues' },
    { value: settings.homeStats.maxGuests, label: 'Max Guests Catered' },
  ]

  return (
    <div>
      {settings.toggles.showBrandCards && <HomeHero verticals={verticals} />}
      <ServicesStrip items={settings.servicesStrip} />
      {settings.toggles.showWhyChooseUs && (
        <IconCardGrid eyebrow="Why Choose Us" title={<>Why Families &amp; Corporates <strong className="italic font-normal">Choose Us</strong></>} items={settings.whyChooseUs} />
      )}
      <StatsBand stats={stats} />
      {settings.toggles.showReviews && <TestimonialsGrid testimonials={testimonials} />}
      {settings.taglineband && (
        <div className="bg-gold2/20 py-10 text-center">
          <p className="font-serif text-[clamp(18px,2.2vw,26px)] italic text-maroon">{settings.taglineband}</p>
        </div>
      )}
    </div>
  )
}
