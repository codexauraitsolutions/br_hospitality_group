import { IconCard } from '@/types'

export default function IconCardGrid({ eyebrow, title, items }: { eyebrow: string; title: React.ReactNode; items: IconCard[] }) {
  if (!items.length) return null
  return (
    <div className="bg-cream2 py-16">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        <div className="text-[.7rem] tracking-[.3em] uppercase text-gold font-semibold mb-2">{eyebrow}</div>
        <div className="font-serif text-[clamp(24px,3vw,34px)] font-light mb-10">{title}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-border rounded-lg p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-serif text-[1.05rem] font-semibold text-maroon mb-2">{item.title}</div>
              <div className="text-[.76rem] text-muted leading-relaxed">{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
