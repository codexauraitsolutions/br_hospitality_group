'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Vertical } from '@/types'

export default function VenueHero({ vertical, images }: { vertical: Vertical; images: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % images.length), 5000)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div className="relative h-[54vh] min-h-[380px] max-h-[600px] overflow-hidden text-white text-center" style={{ background: vertical.color }}>
      {images.length > 0 ? (
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1 }, scale: { duration: 5.5, ease: 'linear' } }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[index]} alt="" className="w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${vertical.color}, ${vertical.color}cc)` }} />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/60" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, white 0, transparent 35%), radial-gradient(circle at 85% 75%, white 0, transparent 35%)' }} />

      <div className="relative h-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-[.7rem] tracking-[.3em] uppercase text-gold2 font-semibold mb-3"
        >
          {vertical.category}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
          className="font-serif text-[clamp(30px,4.5vw,52px)] font-light mb-3"
        >
          {vertical.icon} {vertical.name}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.24 }}
          className="text-sm text-white/85 flex items-center gap-3"
        >
          📍 {vertical.location}
          {vertical.status === 'draft' && <span className="bg-amber-500/80 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">Coming Soon</span>}
        </motion.div>

        {images.length > 1 && (
          <div className="absolute bottom-6 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
