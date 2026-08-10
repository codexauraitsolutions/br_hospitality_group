import { ServiceItem } from '@/types'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'

export default function ServicesStrip({ items }: { items: ServiceItem[] }) {
  if (!items.length) return null
  return (
    <div className="bg-cream border-y border-border py-4">
      <Stagger className="max-w-[1280px] mx-auto px-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-2" stagger={0.04}>
        {items.map((item, i) => (
          <StaggerItem key={i} y={8} className="text-[.78rem] font-medium text-ink whitespace-nowrap transition-transform duration-200 hover:-translate-y-0.5 hover:text-maroon">
            {item.icon} {item.label}
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
