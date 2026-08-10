'use client'
import { useState } from 'react'

/** Tries the CMS-uploaded photo first, then a static file at /public/images/balraj.jpeg
 * (drop the file there and it appears with no code change), then an icon placeholder. */
export default function FounderPhoto({ photoUrl, name }: { photoUrl: string; name: string }) {
  const [staticFailed, setStaticFailed] = useState(false)
  const src = photoUrl || (staticFailed ? '' : '/images/balraj.jpeg')

  if (!src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-maroon to-maroon2 flex items-center justify-center text-6xl text-white/80">👤</div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setStaticFailed(true)} />
  )
}
