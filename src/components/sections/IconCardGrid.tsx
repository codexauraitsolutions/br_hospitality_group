import { IconCard } from '@/types'
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal'

export default function IconCardGrid({ eyebrow, title, items }: { eyebrow: string; title: React.ReactNode; items: IconCard[] }) {
  if (!items.length) return null
  return (
    <div className="bg-cream2 py-16">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        <Reveal>
          <div className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-2">{eyebrow}</div>
          <div className="font-serif text-[clamp(24px,3vw,34px)] font-light mb-10">{title}</div>
        </Reveal>
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <div className="group bg-white border border-border rounded-lg p-6 text-center h-full transition-all duration-300 hover:shadow-[0_18px_40px_-14px_rgba(26,45,90,0.22)] hover:-translate-y-1.5 hover:border-gold/50">
                <div className="text-3xl mb-3 inline-block transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">{item.icon}</div>
                <div className="font-serif text-[1.05rem] font-semibold text-maroon mb-2">{item.title}</div>
                <div className="text-[.76rem] text-muted leading-relaxed">{item.text}</div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  )
}
