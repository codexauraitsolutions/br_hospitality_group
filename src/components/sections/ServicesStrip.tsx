import { ServiceItem } from '@/types'

export default function ServicesStrip({ items }: { items: ServiceItem[] }) {
  if (!items.length) return null
  return (
    <div className="bg-cream border-y border-border py-4">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-2">
        {items.map((item, i) => (
          <div key={i} className="text-[.78rem] font-medium text-ink whitespace-nowrap">
            {item.icon} {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
