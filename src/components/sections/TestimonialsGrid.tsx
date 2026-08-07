import { Testimonial } from '@/types'

export default function TestimonialsGrid({ testimonials, eyebrow = 'Testimonials', title = <>What Our <strong className="italic font-normal">Guests Say</strong></> }: {
  testimonials: Testimonial[]; eyebrow?: string; title?: React.ReactNode
}) {
  if (!testimonials.length) return null
  return (
    <div className="py-16">
      <div className="max-w-[1100px] mx-auto px-6 text-center">
        <div className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-2">{eyebrow}</div>
        <div className="font-serif text-[clamp(24px,3vw,34px)] font-light mb-10">{title}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white border border-border rounded-lg p-6 text-left">
              <div className="text-gold text-base mb-2.5 tracking-wider">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
              <div className="text-[.8rem] leading-relaxed text-muted italic mb-3.5">&quot;{t.quote}&quot;</div>
              <div className="text-[.72rem] font-semibold text-ink">{t.name}</div>
              {t.role && <div className="text-[.66rem] text-muted">{t.role}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
