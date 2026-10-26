// Client-side video helpers for the admin uploader. Phone clips arrive as 4K portrait
// (17MB for 15s is normal), which is far heavier than the site ever displays, and they
// carry no poster frame — so the tile is blank until the viewer presses play.

/** Longest edge we keep. 1080x1920 is already more than the venue page ever renders. */
export const MAX_VIDEO_DIMENSION = 1920
/** Anything already at or under this bitrate is left alone rather than re-encoded. */
const ACCEPTABLE_BITRATE = 4_000_000
/** The canvas is driven by frame callbacks, which browsers throttle hard when the tab
 * isn't visible. Below this achieved rate the re-encode is visibly choppy, so we throw
 * it away and upload the original rather than publish a stuttering clip. */
const MIN_ACCEPTABLE_FPS = 15
const POSTER_MAX_DIMENSION = 1280
const POSTER_QUALITY = 0.75
const TARGET_FPS = 30

/** MediaRecorder must give us H.264 in MP4. We deliberately do NOT fall back to WebM:
 * Safari/iOS can't reliably play it, and shipping an unplayable file to phone visitors
 * would be worse than leaving the original alone. */
const MP4_MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.4d002a,mp4a.40.2',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4;codecs=avc1',
  'video/mp4',
]

function supportedMp4Mime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  return MP4_MIME_CANDIDATES.find(m => MediaRecorder.isTypeSupported(m)) ?? null
}

export function canTranscodeVideo(): boolean {
  return typeof document !== 'undefined'
    && typeof HTMLCanvasElement.prototype.captureStream === 'function'
    && supportedMp4Mime() !== null
}

export interface VideoMeta { width: number; height: number; duration: number }

function loadVideo(file: File): Promise<{ video: HTMLVideoElement; release: () => void }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    const release = () => { URL.revokeObjectURL(url); video.removeAttribute('src'); video.load() }
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.onloadedmetadata = () => resolve({ video, release })
    video.onerror = () => { release(); reject(new Error('Could not read this video file')) }
    setTimeout(() => { reject(new Error('Timed out reading the video')) }, 30_000)
    video.src = url
  })
}

export async function getVideoMeta(file: File): Promise<VideoMeta | null> {
  if (!file.type.startsWith('video/')) return null
  try {
    const { video, release } = await loadVideo(file)
    const meta = { width: video.videoWidth, height: video.videoHeight, duration: video.duration }
    release()
    return meta.width && meta.height ? meta : null
  } catch {
    return null
  }
}

/** Scales (w,h) down so the longest edge is at most `max`, keeping even numbers —
 * H.264 requires even dimensions and odd ones make the encoder fail or pad. */
export function fitWithin(w: number, h: number, max: number) {
  const scale = Math.min(1, max / Math.max(w, h))
  const even = (n: number) => Math.max(2, Math.round(n * scale / 2) * 2)
  return { width: even(w), height: even(h) }
}

/** Grabs a frame to use as the <video poster>, so the tile shows the clip instead of
 * a black box before playback. */
export async function captureVideoPoster(file: File): Promise<{ blob: Blob; width: number; height: number } | null> {
  if (!file.type.startsWith('video/')) return null
  let release = () => {}
  try {
    const loaded = await loadVideo(file)
    release = loaded.release
    const { video } = loaded

    // A touch into the clip — frame zero is often a dark shutter frame.
    const at = Math.min(1, (video.duration || 1) * 0.1)
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve()
      video.onerror = () => reject(new Error('seek failed'))
      setTimeout(resolve, 8000)
      video.currentTime = at
    })

    const { width, height } = fitWithin(video.videoWidth, video.videoHeight, POSTER_MAX_DIMENSION)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas unsupported')
    ctx.drawImage(video, 0, 0, width, height)

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', POSTER_QUALITY),
    )
    release()
    return { blob, width, height }
  } catch {
    release()
    return null
  }
}

export interface TranscodeResult { blob: Blob; width: number; height: number }

/**
 * Re-encodes an oversized clip down to MAX_VIDEO_DIMENSION by playing it into a canvas
 * and recording that canvas as H.264/MP4. This runs in real time (a 30s clip takes ~30s)
 * because MediaRecorder timestamps by wall clock — hence the progress callback.
 *
 * Returns null whenever the original should be uploaded unchanged: already small enough,
 * no MP4 recording support, or anything went wrong mid-encode.
 */
export async function transcodeVideo(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<TranscodeResult | null> {
  const mime = supportedMp4Mime()
  if (!mime || !canTranscodeVideo()) return null

  const meta = await getVideoMeta(file)
  if (!meta) return null

  const bitrateOfSource = meta.duration > 0 ? (file.size * 8) / meta.duration : Infinity
  const alreadySmall = Math.max(meta.width, meta.height) <= MAX_VIDEO_DIMENSION
    && bitrateOfSource <= ACCEPTABLE_BITRATE
  if (alreadySmall) return null

  const { width, height } = fitWithin(meta.width, meta.height, MAX_VIDEO_DIMENSION)
  let release = () => {}

  try {
    const loaded = await loadVideo(file)
    release = loaded.release
    const { video } = loaded

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('canvas unsupported')

    const stream = canvas.captureStream(TARGET_FPS)
    // Keep the audio track from the source so the re-encode isn't silent.
    try {
      const withAudio = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.()
      withAudio?.getAudioTracks().forEach(t => stream.addTrack(t))
    } catch {
      // No audio capture available — carry on with a silent re-encode.
    }

    const videoBitsPerSecond = Math.min(
      5_000_000,
      Math.max(1_500_000, Math.round(width * height * TARGET_FPS * 0.05)),
    )
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond })
    const chunks: BlobPart[] = []
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }

    const finished = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/mp4' }))
      recorder.onerror = () => reject(new Error('recording failed'))
    })

    let stopped = false
    const stop = () => {
      if (stopped) return
      stopped = true
      try { recorder.stop() } catch { /* already stopping */ }
      stream.getTracks().forEach(t => t.stop())
    }

    let framesDrawn = 0
    const draw = () => {
      if (stopped) return
      ctx.drawImage(video, 0, 0, width, height)
      framesDrawn++
      if (meta.duration > 0) onProgress?.(Math.min(1, video.currentTime / meta.duration))
      schedule()
    }
    // requestVideoFrameCallback fires per decoded frame, so the canvas tracks the real
    // frame rate; rAF is the fallback where it isn't implemented.
    type WithRvfc = HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }
    const rvfc = (video as WithRvfc).requestVideoFrameCallback?.bind(video)
    const schedule = () => { if (rvfc) rvfc(draw); else requestAnimationFrame(draw) }

    video.onended = stop
    recorder.start(1000)
    await video.play()
    schedule()

    // Hard ceiling so a stalled decode can't hang the upload forever.
    const guard = setTimeout(stop, (meta.duration + 20) * 1000)
    const blob = await finished
    clearTimeout(guard)
    release()

    // A re-encode that came out bigger than the source helps nobody.
    if (blob.size === 0 || blob.size >= file.size) return null

    // If the tab was backgrounded the draw loop stalls and the output stutters, so
    // check what we actually achieved rather than what we asked for.
    const achievedFps = meta.duration > 0 ? framesDrawn / meta.duration : 0
    if (achievedFps < MIN_ACCEPTABLE_FPS) return null

    return { blob, width, height }
  } catch {
    release()
    return null
  }
}
