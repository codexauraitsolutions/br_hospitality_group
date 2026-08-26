'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { SiteSettings, TeamMember } from '@/types'
import FounderPhoto from '@/components/sections/FounderPhoto'

export default function HeroSlideshow({ settings, images, venueCount, founder }: { settings: SiteSettings; images: string[]; venueCount: number; founder?: TeamMember }) {
  const [index, setIndex] = useState(0)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 150])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  // The founder welcome slide is a fixed slot at index 0 — slides after it cycle
  // through the venue photos as before.
  const slideCount = images.length + (founder ? 1 : 0)

  useEffect(() => {
    if (slideCount < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % slideCount), 5500)
    return () => clearInterval(id)
  }, [slideCount])

  const isFounderSlide = !!founder && index === 0
  const imageIndex = founder ? index - 1 : index

  return (
    <div className="relative h-[92vh] min-h-[560px] max-h-[900px] overflow-hidden bg-maroon">
      <motion.div className="absolute inset-0" style={{ y }}>
        <AnimatePresence mode="sync">
          {isFounderSlide ? (
            <motion.div
              key="founder"
              className="absolute inset-0 bg-gradient-to-br from-maroon to-maroon2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.1]"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #c9a84c 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 40%)' }} />
            </motion.div>
          ) : images.length > 0 ? (
            <motion.div
              key={imageIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: 'linear' } }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[imageIndex]} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {!isFounderSlide && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#120e0a]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </>
      )}

      <motion.div className="relative h-full flex flex-col items-center justify-center text-center px-6" style={{ opacity }}>
        {isFounderSlide && founder ? (
          <AnimatePresence mode="wait">
            <motion.div key="founder-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="text-[.68rem] tracking-[.3em] uppercase text-gold2 font-semibold mb-4"
              >
                {founder.name} Garu Presents
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="relative mb-5"
              >
                <div className="absolute -inset-5 rounded-full bg-gold2/25 blur-2xl" />
                <div className="absolute -inset-2 rounded-full border border-gold2/40" />
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden border-4 border-gold2 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.65)]">
                  <FounderPhoto photoUrl={founder.photoUrl} name={founder.name} />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
                className="font-serif text-white font-light text-[clamp(28px,5.5vw,56px)] leading-[1.1] max-w-3xl"
              >
                {settings.siteName || 'BR Hospitality Group'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-4 text-white/80 text-sm md:text-base max-w-2xl leading-relaxed italic"
              >
                &ldquo;Built on 30+ years of genuine warmth and uncompromising quality — welcome to a legacy of hospitality I&apos;m proud to share with you.&rdquo;
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
                className="mt-3 inline-flex items-center gap-2 border border-gold2/50 rounded-full px-5 py-2 text-gold2 text-[.72rem] uppercase tracking-wider font-semibold"
              >
                {founder.name} · {founder.role}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65 }}
                className="mt-6 flex flex-wrap gap-3.5 justify-center"
              >
                <Link href="#verticals"
                  className="bg-gold text-white text-[.72rem] font-semibold uppercase tracking-[.14em] px-7 py-3.5 rounded-full transition-all hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(201,168,76,0.6)]">
                  Explore Our Venues
                </Link>
                <Link href="/contact"
                  className="border border-white/40 text-white text-[.72rem] font-semibold uppercase tracking-[.14em] px-7 py-3.5 rounded-full backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-0.5">
                  Enquire Now
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-[.68rem] tracking-[.35em] uppercase text-gold2 font-semibold mb-4"
            >
              {settings.tagline || 'Hospitality Beyond Expectations'}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-white font-light text-[clamp(34px,6vw,68px)] leading-[1.08] max-w-4xl"
            >
              {settings.siteName || 'BR Hospitality Group'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-5 text-white/75 text-sm md:text-base max-w-xl leading-relaxed"
            >
              {venueCount || 'Several'} distinct venues across Hyderabad — fine dining, grand conventions, luxury resorts, farm stays and catering, all under one legacy.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-9 flex flex-wrap gap-3.5 justify-center"
            >
              <Link href="#verticals"
                className="bg-gold text-white text-[.72rem] font-semibold uppercase tracking-[.14em] px-7 py-3.5 rounded-full transition-all hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(201,168,76,0.6)]">
                Explore Our Venues
              </Link>
              <Link href="/contact"
                className="border border-white/40 text-white text-[.72rem] font-semibold uppercase tracking-[.14em] px-7 py-3.5 rounded-full backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-0.5">
                Enquire Now
              </Link>
            </motion.div>
          </>
        )}

        {slideCount > 1 && (
          <div className="absolute bottom-24 md:bottom-10 flex gap-2">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        )}

        <motion.div
          className="absolute bottom-8 md:bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-white/50"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[.6rem] tracking-[.2em] uppercase">Scroll</span>
          <span className="text-lg leading-none">↓</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
