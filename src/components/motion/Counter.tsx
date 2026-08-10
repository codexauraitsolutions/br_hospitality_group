'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

/** Animates a stat value's leading number counting up from 0 when it scrolls into view.
 * Handles values like "15+", "50K+", "7", "5000" — the numeric part counts up, any
 * prefix/suffix (K+, +, etc.) stays static. Falls back to plain text for non-numeric values. */
export default function Counter({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState('0')

  const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/)

  useEffect(() => {
    if (!inView) return
    if (!match) { setDisplay(value); return }
    const [, prefix, numStr, suffix] = match
    const target = parseFloat(numStr)
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: latest => setDisplay(`${prefix}${latest.toFixed(decimals)}${suffix}`),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return (
    <motion.span ref={ref}>{match ? display : value}</motion.span>
  )
}
