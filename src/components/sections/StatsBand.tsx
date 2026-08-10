import Counter from '@/components/motion/Counter'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'

export default function StatsBand({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="relative bg-maroon py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)' }} />
      <Stagger className="relative max-w-[900px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-5 text-center" stagger={0.1}>
        {stats.map((s, i) => (
          <StaggerItem key={i}>
            <div className="font-serif text-[2.8rem] font-semibold text-gold2 leading-none tabular-nums">
              <Counter value={s.value} />
            </div>
            <div className="text-[.62rem] tracking-[.2em] uppercase text-white/65 mt-1.5 font-semibold">{s.label}</div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
