'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { MediaSection, MediaItem, VerticalSlug } from '@/types'

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
      }),
    })

    onUploaded({
      id: created.id, section, verticalSlug: verticalSlug || null, s3Key: key, url: publicUrl, type,
      filename, size: uploadBody.size, ...dims, caption: '', sortOrder: 0, active: true,
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
        <div className="text-[13px] text-muted">Uploading {progress.done}/{progress.total}…</div>
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
