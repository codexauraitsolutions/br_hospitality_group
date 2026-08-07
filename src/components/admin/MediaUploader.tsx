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

export default function MediaUploader({ section, verticalSlug, accept = 'image/*,video/*', onUploaded }: {
  section: MediaSection
  verticalSlug?: VerticalSlug
  accept?: string
  onUploaded: (item: MediaItem) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })

  const uploadOne = async (file: File) => {
    const { uploadUrl, key, publicUrl } = await authedJson<{ uploadUrl: string; key: string; publicUrl: string }>(
      '/api/upload/presign',
      { method: 'POST', body: JSON.stringify({ filename: file.name, contentType: file.type, section, verticalSlug }) },
    )

    const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
    if (!putRes.ok) throw new Error(`Upload to storage failed for ${file.name}`)

    const dims = await getImageDimensions(file)
    const type = file.type.startsWith('video/') ? 'video' : 'image'

    const created = await authedJson<{ id: string }>('/api/media', {
      method: 'POST',
      body: JSON.stringify({
        section, verticalSlug, s3Key: key, url: publicUrl, type,
        filename: file.name, size: file.size, ...dims, caption: '',
      }),
    })

    onUploaded({
      id: created.id, section, verticalSlug: verticalSlug || null, s3Key: key, url: publicUrl, type,
      filename: file.name, size: file.size, ...dims, caption: '', sortOrder: 0, active: true,
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
