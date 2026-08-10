'use client'
import { motion } from 'framer-motion'

/** Fades + slides children up into place once they scroll into view. Wrap any section/card in this. */
export default function Reveal({
  children, delay = 0, y = 24, className, direction = 'up',
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  direction?: 'up' | 'left' | 'right' | 'none'
}) {
  const initial =
    direction === 'up' ? { opacity: 0, y } :
    direction === 'left' ? { opacity: 0, x: -y } :
    direction === 'right' ? { opacity: 0, x: y } :
    { opacity: 0 }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Staggers its direct children's Reveal-like entrance. Use with <Stagger><StaggerItem/>...</Stagger>. */
export function Stagger({ children, className, stagger = 0.08 }: { children: React.ReactNode; className?: string; stagger?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, y = 24 }: { children: React.ReactNode; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
    >
      {children}
    </motion.div>
  )
}
