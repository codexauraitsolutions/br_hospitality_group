'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import MediaUploader from '@/components/admin/MediaUploader'
import { Btn, IconBtn } from '@/components/admin/ui'
import { MediaItem, MediaSection, VerticalSlug } from '@/types'

export default function SingleImageField({
  currentUrl, currentMediaId, section, verticalSlug, onChange, aspect = 'aspect-video', fit = 'cover',
}: {
  currentUrl: string
  currentMediaId: string | null
  section: MediaSection
  verticalSlug?: VerticalSlug
  onChange: (item: { url: string; mediaId: string } | null) => void
  aspect?: string
  fit?: 'cover' | 'contain'
}) {
  const [replacing, setReplacing] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleUploaded = async (item: MediaItem) => {
    setBusy(true)
    try {
      if (currentMediaId) await authedJson(`/api/media/${currentMediaId}`, { method: 'DELETE' }).catch(() => {})
      onChange({ url: item.url, mediaId: item.id })
      setReplacing(false)
      toast.success('Image updated')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!currentMediaId) { onChange(null); return }
    if (!confirm('Delete this image? This also removes it from S3 storage permanently.')) return
    setBusy(true)
    try {
      await authedJson(`/api/media/${currentMediaId}`, { method: 'DELETE' })
      onChange(null)
      toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  if (currentUrl && !replacing) {
    return (
      <div className="relative inline-block w-full max-w-sm group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={currentUrl} alt="" className={`w-full rounded-lg bg-bg p-2 box-border border border-border ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${aspect}`} />
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          <div className="bg-white/95 rounded-lg shadow-sm">
            <IconBtn icon="✏️" label="Replace image" disabled={busy} onClick={() => setReplacing(true)} />
          </div>
          <div className="bg-white/95 rounded-lg shadow-sm">
            <IconBtn icon="🗑" label="Delete image" variant="red" disabled={busy} onClick={handleDelete} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <MediaUploader section={section} verticalSlug={verticalSlug} accept="image/*" onUploaded={handleUploaded} />
      {replacing && (
        <Btn variant="outline" className="mt-2" onClick={() => setReplacing(false)}>Cancel</Btn>
      )}
    </div>
  )
}
