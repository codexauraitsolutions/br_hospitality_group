import { TeamMember } from '@/types'
import FounderPhoto from '@/components/sections/FounderPhoto'
import Reveal from '@/components/motion/Reveal'

export default function FounderSpotlight({ founder }: { founder: TeamMember }) {
  return (
    <div className="relative bg-gradient-to-br from-maroon to-maroon2 py-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, #c9a84c 0, transparent 35%), radial-gradient(circle at 10% 85%, white 0, transparent 30%)' }} />
      <div className="relative max-w-[1050px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[minmax(0,340px)_1fr] gap-12 items-center">
        <Reveal direction="left">
          <div className="relative mx-auto md:mx-0 w-full max-w-[320px]">
            <div className="absolute -inset-3 border border-gold2/40 rounded-2xl" />
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_30px_60px_-16px_rgba(0,0,0,0.5)] border-4 border-white">
              <FounderPhoto photoUrl={founder.photoUrl} name={founder.name} />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gold text-white text-[.62rem] font-semibold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
              30+ Years of Leadership
            </div>
          </div>
        </Reveal>
        <Reveal direction="right" delay={0.1}>
          <div className="font-serif text-6xl text-gold2/30 leading-none mb-2 select-none">&ldquo;</div>
          <div className="text-[.72rem] tracking-[.3em] uppercase text-gold2 font-semibold mb-2 -mt-4">Meet Our Founder</div>
          <div className="font-serif text-[clamp(28px,3.5vw,40px)] font-light text-white mb-1">{founder.name}</div>
          <div className="text-[.74rem] text-gold2 uppercase tracking-wider font-semibold mb-5">{founder.role}</div>
          {founder.bio.split('\n\n').map((p, i) => (
            <p key={i} className="text-[.87rem] leading-relaxed text-white/75 mb-3 last:mb-0">{p}</p>
          ))}
        </Reveal>
      </div>
    </div>
  )
}
