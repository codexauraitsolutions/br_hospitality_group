'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { MediaSection, MediaItem, VerticalSlug } from '@/types'
import { getVideoMeta, captureVideoPoster, transcodeVideo } from '@/lib/videoProcessing'

function getImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith('image/')) return Promise.resolve({})
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { resolve({}); URL.revokeObjectURL(url) }
    img.src = url
  })
}

const MAX_DIMENSION = 2000
const JPEG_QUALITY = 0.8

/** Camera photos come in at 20-50MB; downscale + re-encode client-side before they ever
 * hit S3, since nothing downstream (upload pipeline, <img> tags) resizes them otherwise. */
async function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  let { width, height } = bitmap
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unsupported')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', JPEG_QUALITY)
  )
  return { blob, width, height }
}

export default function MediaUploader({ section, verticalSlug, accept = 'image/*,video/*', onUploaded }: {
  section: MediaSection
  verticalSlug?: VerticalSlug
  accept?: string
  onUploaded: (item: MediaItem) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [stage, setStage] = useState('')

  const uploadOne = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    let uploadBody: File | Blob = file
    let contentType = file.type
    let filename = file.name
    let dims: { width?: number; height?: number } = {}

    if (isImage) {
      try {
        const { blob, width, height } = await compressImage(file)
        dims = { width, height }
        if (blob.size < file.size) {
          uploadBody = blob
          contentType = 'image/jpeg'
          filename = file.name.replace(/\.[^.]+$/, '') + '.jpg'
        }
      } catch {
        dims = await getImageDimensions(file)
      }
    }

    // Phone clips land as 4K portrait at ~10 Mbps — far more than the site ever shows,
    // and with no poster the tile is a black box until the viewer hits play.
    let poster: { url: string; key: string } | null = null
    if (!isImage && file.type.startsWith('video/')) {
      const meta = await getVideoMeta(file)
      if (meta) dims = { width: meta.width, height: meta.height }

      setStage('Creating thumbnail…')
      const shot = await captureVideoPoster(file)
      if (shot) {
        const posterName = file.name.replace(/\.[^.]+$/, '') + '-poster.jpg'
        try {
          const pre = await authedJson<{ uploadUrl: string; key: string; publicUrl: string }>(
            '/api/upload/presign',
            { method: 'POST', body: JSON.stringify({ filename: posterName, contentType: 'image/jpeg', section, verticalSlug }) },
          )
          const res = await fetch(pre.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: shot.blob })
          if (res.ok) poster = { url: pre.publicUrl, key: pre.key }
        } catch {
          // A missing thumbnail shouldn't block the video itself from uploading.
        }
      }

      // Real-time re-encode, so tell the admin how far along it is rather than freezing.
      setStage('Compressing video… 0%')
      const smaller = await transcodeVideo(file, f => setStage(`Compressing video… ${Math.round(f * 100)}%`))
      if (smaller) {
        uploadBody = smaller.blob
        contentType = 'video/mp4'
        filename = file.name.replace(/\.[^.]+$/, '') + '.mp4'
        dims = { width: smaller.width, height: smaller.height }
      }
      setStage('Uploading…')
    }

    const { uploadUrl, key, publicUrl } = await authedJson<{ uploadUrl: string; key: string; publicUrl: string }>(
      '/api/upload/presign',
      { method: 'POST', body: JSON.stringify({ filename, contentType, section, verticalSlug }) },
    )

    const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: uploadBody })
    if (!putRes.ok) throw new Error(`Upload to storage failed for ${file.name}`)

    const type = file.type.startsWith('video/') ? 'video' : 'image'

    const created = await authedJson<{ id: string }>('/api/media', {
      method: 'POST',
      body: JSON.stringify({
        section, verticalSlug, s3Key: key, url: publicUrl, type,
        filename, size: uploadBody.size, ...dims, caption: '',
        posterUrl: poster?.url, posterS3Key: poster?.key,
      }),
    })

    onUploaded({
      id: created.id, section, verticalSlug: verticalSlug || null, s3Key: key, url: publicUrl, type,
      filename, size: uploadBody.size, ...dims, caption: '', sortOrder: 0, active: true,
      posterUrl: poster?.url ?? null, posterS3Key: poster?.key ?? null,
      createdAt: new Date().toISOString(),
    })
  }

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return
    setUploading(true)
    setProgress({ done: 0, total: files.length })
    let failed = 0
    for (const file of files) {
      try {
        await uploadOne(file)
      } catch (err) {
        failed++
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`)
      }
      setProgress(p => ({ ...p, done: p.done + 1 }))
      setStage('')
    }
    setUploading(false)
    if (failed === 0) toast.success(`${files.length} file(s) uploaded`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, verticalSlug])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === 'image/*,video/*' ? { 'image/*': [], 'video/*': [] } : { [accept]: [] },
    disabled: uploading,
  })

  return (
    <div {...getRootProps()}
      className={`border-2 border-dashed rounded-lg py-8 px-4 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
      } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
      <input {...getInputProps()} />
      {uploading ? (
        <div className="text-[13px] text-muted">
          <div>Uploading {progress.done}/{progress.total}…</div>
          {stage && <div className="text-[11px] mt-1 text-gold">{stage}</div>}
          {stage.startsWith('Compressing') && (
            <div className="text-[10px] mt-1 opacity-70">Large videos are resized here — keep this tab open.</div>
          )}
        </div>
      ) : (
        <>
          <div className="text-2xl mb-1.5">⬆️</div>
          <div className="text-[13px] font-medium">Drag &amp; drop files, or click to browse</div>
          <div className="text-[11px] text-muted mt-1">Images and videos supported</div>
        </>
      )}
    </div>
  )
}
