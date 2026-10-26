'use client'
import { useEffect, useRef, useState } from 'react'

/** Phone footage is portrait, so a fixed 16:9 box with object-cover crops it to a middle
 * sliver. Start from the stored dimensions when we have them, and fall back to reading
 * the real ones off the element once metadata arrives — records uploaded before videos
 * captured dimensions then fix themselves with no re-upload. */
export default function VenueVideo({ src, poster, width, height }: {
  src: string
  poster?: string | null
  width?: number | null
  height?: number | null
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [ratio, setRatio] = useState<string | null>(
    width && height ? `${width} / ${height}` : null,
  )

  const readFrom = (v: HTMLVideoElement | null) => {
    if (v?.videoWidth && v.videoHeight) setRatio(`${v.videoWidth} / ${v.videoHeight}`)
  }

  // The markup is server-rendered, so the browser can finish loading metadata before
  // React hydrates — in which case loadedmetadata already fired and the handler below
  // never runs. Read the dimensions directly if they're there by the time we mount.
  useEffect(() => { readFrom(ref.current) }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster || undefined}
      controls
      playsInline
      // With a poster AND known dimensions there's nothing left to learn from the file,
      // so skip the fetch until someone presses play. Without dimensions we still need
      // metadata, otherwise the ratio fallback above never gets its numbers.
      preload={poster && ratio ? 'none' : 'metadata'}
      onLoadedMetadata={e => readFrom(e.currentTarget)}
      className={`w-full max-h-[70vh] rounded-md bg-black object-contain ${ratio ? '' : 'aspect-video'}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    />
  )
}
