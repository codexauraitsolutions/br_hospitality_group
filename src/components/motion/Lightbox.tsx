'use client'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MediaItem } from '@/types'

export default function Lightbox({ items, index, onClose, onNav }: {
  items: MediaItem[]
  index: number | null
  onClose: () => void
  onNav: (next: number) => void
}) {
  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav((index + 1) % items.length)
      if (e.key === 'ArrowLeft') onNav((index - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [index, items.length, onClose, onNav])

  const item = index !== null ? items[index] : null

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[600] bg-black/90 flex items-center justify-center p-4 md:p-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center"
            onClick={onClose} aria-label="Close">✕</button>

          {items.length > 1 && (
            <>
              <button
                className="absolute left-3 md:left-6 text-white/70 hover:text-white text-3xl w-12 h-12 flex items-center justify-center"
                onClick={e => { e.stopPropagation(); onNav((index! - 1 + items.length) % items.length) }} aria-label="Previous">‹</button>
              <button
                className="absolute right-3 md:right-6 text-white/70 hover:text-white text-3xl w-12 h-12 flex items-center justify-center"
                onClick={e => { e.stopPropagation(); onNav((index! + 1) % items.length) }} aria-label="Next">›</button>
            </>
          )}

          <motion.div
            key={item.id}
            className="max-w-5xl max-h-full"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
          >
            {item.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.caption || item.filename} className="max-w-full max-h-[85vh] object-contain rounded-md" />
            ) : (
              <video src={item.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-md" />
            )}
            {item.caption && <div className="text-white/70 text-center text-sm mt-3">{item.caption}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
