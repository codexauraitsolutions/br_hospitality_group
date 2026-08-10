'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { SiteSettings } from '@/types'

export default function HeroSlideshow({ settings, images, venueCount }: { settings: SiteSettings; images: string[]; venueCount: number }) {
  const [index, setIndex] = useState(0)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 150])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  useEffect(() => {
    if (images.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % images.length), 5500)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div className="relative h-[92vh] min-h-[560px] max-h-[900px] overflow-hidden bg-maroon">
      <motion.div className="absolute inset-0" style={{ y }}>
        <AnimatePresence mode="sync">
          {images.length > 0 && (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: 'linear' } }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[index]} alt="" className="w-full h-full object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#120e0a]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <motion.div className="relative h-full flex flex-col items-center justify-center text-center px-6" style={{ opacity }}>
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

        {images.length > 1 && (
          <div className="absolute bottom-24 md:bottom-10 flex gap-2">
            {images.map((_, i) => (
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
