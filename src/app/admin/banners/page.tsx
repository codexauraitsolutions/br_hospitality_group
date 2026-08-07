'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { Card, Btn } from '@/components/admin/ui'
import MediaUploader from '@/components/admin/MediaUploader'
import MediaGrid from '@/components/admin/MediaGrid'
import { RequireSuperAdmin } from '@/components/admin/RequireRole'
import { SiteSettings, SiteToggles, MediaItem } from '@/types'

const TOGGLE_LABELS: Record<keyof SiteToggles, string> = {
  showBrandCards: 'Show Brand Cards on Homepage',
  showSlideshow: 'Homepage Image Slideshow',
  showVideos: 'Show Venue Videos',
  showGallery: 'Photo Gallery Section',
  showReviews: 'Guest Reviews Section',
  showWhatsappFloat: 'WhatsApp Floating Button',
  showWhyChooseUs: 'Show Why Choose Us Section',
}

export default function BannersPageGuarded() {
  return <RequireSuperAdmin><BannersPage /></RequireSuperAdmin>
}

function BannersPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [banners, setBanners] = useState<MediaItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { if (d.success) setSettings(d.settings) })
    authedJson<{ media: MediaItem[] }>('/api/media?section=banner').then(d => setBanners(d.media)).catch(() => {})
  }, [])

  const toggle = (key: keyof SiteToggles) => {
    setSettings(s => s && ({ ...s, toggles: { ...s.toggles, [key]: !s.toggles[key] } }))
  }

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await authedJson('/api/settings', { method: 'PUT', body: JSON.stringify({ toggles: settings.toggles }) })
      toast.success('Display settings saved!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <div className="text-center py-8 text-muted text-sm">Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold">Banners &amp; Display</h1>
          <p className="text-[12px] text-muted">Control which sections appear on the public site</p>
        </div>
        <Btn variant="gold" disabled={saving} onClick={save}>{saving ? 'Saving…' : '💾 Save'}</Btn>
      </div>

      <Card title="Section Visibility">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(TOGGLE_LABELS) as (keyof SiteToggles)[]).map(key => (
            <label key={key} className="flex items-center gap-2.5 text-[13px] border border-border rounded-md px-3.5 py-2.5 cursor-pointer">
              <input type="checkbox" checked={settings.toggles[key]} onChange={() => toggle(key)} />
              {TOGGLE_LABELS[key]}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Homepage Banner Images">
        <MediaUploader section="banner" accept="image/*" onUploaded={item => setBanners(b => [item, ...b])} />
        <div className="mt-4">
          <MediaGrid items={banners} onDeleted={id => setBanners(b => b.filter(x => x.id !== id))} />
        </div>
      </Card>
    </div>
  )
}
