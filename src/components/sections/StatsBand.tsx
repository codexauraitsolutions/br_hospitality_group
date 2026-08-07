export default function StatsBand({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="bg-maroon py-12">
      <div className="max-w-[900px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="font-serif text-[2.8rem] font-semibold text-gold2 leading-none">{s.value}</div>
            <div className="text-[.62rem] tracking-[.2em] uppercase text-white/65 mt-1.5 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
