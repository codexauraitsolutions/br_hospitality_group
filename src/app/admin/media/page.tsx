'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { useStaff } from '@/components/admin/RoleContext'
import { Card, Select } from '@/components/admin/ui'
import MediaUploader from '@/components/admin/MediaUploader'
import MediaGrid from '@/components/admin/MediaGrid'
import { MediaItem, Vertical, VerticalSlug } from '@/types'

export default function AllMediaPage() {
  const staff = useStaff()
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [selectedVertical, setSelectedVertical] = useState<VerticalSlug | ''>('')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/verticals').then(r => r.json()).then(d => {
      if (!d.success) return
      const list: Vertical[] = staff.role === 'super_admin' ? d.verticals : d.verticals.filter((v: Vertical) => staff.assignedVerticals.includes(v.slug))
      setVerticals(list)
      if (list.length && !selectedVertical) setSelectedVertical(list[0].slug)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async (vertical: VerticalSlug | '') => {
    if (!vertical) return
    setLoading(true)
    try {
      const { media } = await authedJson<{ media: MediaItem[] }>(`/api/media?verticalSlug=${vertical}&section=vertical_gallery`)
      const { media: videos } = await authedJson<{ media: MediaItem[] }>(`/api/media?verticalSlug=${vertical}&section=vertical_video`)
      setMedia([...media, ...videos])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (selectedVertical) load(selectedVertical) }, [selectedVertical])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold">All Media</h1>
        <p className="text-[12px] text-muted">Photos and videos across your venues — stored in AWS S3</p>
      </div>

      <Card>
        <div className="mb-4 max-w-xs">
          <Select value={selectedVertical} onChange={e => setSelectedVertical(e.target.value as VerticalSlug)}>
            {verticals.map(v => <option key={v.slug} value={v.slug}>{v.icon} {v.name}</option>)}
          </Select>
        </div>

        {selectedVertical && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <MediaUploader section="vertical_gallery" verticalSlug={selectedVertical}
                onUploaded={item => setMedia(m => [item, ...m])} accept="image/*" />
              <MediaUploader section="vertical_video" verticalSlug={selectedVertical}
                onUploaded={item => setMedia(m => [item, ...m])} accept="video/*" />
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted text-sm">Loading…</div>
            ) : (
              <MediaGrid items={media} onDeleted={id => setMedia(m => m.filter(x => x.id !== id))} />
            )}
          </>
        )}
      </Card>
    </div>
  )
}
