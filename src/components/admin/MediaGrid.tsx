'use client'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { EmptyState } from '@/components/admin/ui'
import { MediaItem } from '@/types'

export default function MediaGrid({ items, onDeleted, emptyLabel = 'No media uploaded yet' }: {
  items: MediaItem[]; onDeleted: (id: string) => void; emptyLabel?: string
}) {
  const remove = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.filename}"? This also removes it from S3 storage permanently.`)) return
    try {
      await authedJson(`/api/media/${item.id}`, { method: 'DELETE' })
      toast.success('Deleted')
      onDeleted(item.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (!items.length) {
    return <EmptyState icon="🖼️" text={emptyLabel} />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map(item => (
        <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-bg shadow-sm">
          {item.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
          ) : (
            <video src={item.url} className="w-full h-full object-cover" muted />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
            <span className="text-white text-[10px] truncate max-w-[70%] drop-shadow">{item.filename}</span>
            <button onClick={() => remove(item)} title="Delete" aria-label="Delete"
              className="w-7 h-7 flex-shrink-0 rounded-lg bg-white/90 hover:bg-white text-danger text-[12px] border-none cursor-pointer flex items-center justify-center transition-colors">
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
