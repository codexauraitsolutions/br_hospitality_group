'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { Card, Btn, Badge, Field, Input, TextArea, Select, IconBtn, Th, Td, TableWrap, EmptyState, StatusDot } from '@/components/admin/ui'
import MediaUploader from '@/components/admin/MediaUploader'
import MediaGrid from '@/components/admin/MediaGrid'
import SingleImageField from '@/components/admin/SingleImageField'
import { RequireVerticalAccess } from '@/components/admin/RequireRole'
import { Vertical, MediaItem, Booking, BookingStatus, VerticalSlug, Highlight } from '@/types'

type Tab = 'overview' | 'images' | 'videos' | 'bookings' | 'edit'

function highlightsToText(items: Highlight[]) { return items.map(h => `${h.value}|${h.label}`).join('\n') }
function textToHighlights(text: string): Highlight[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const [value, ...rest] = line.split('|')
    return { value: (value || '').trim(), label: rest.join('|').trim() }
  })
}

export default function VerticalDetailAdminPageGuarded() {
  const params = useParams<{ slug: string }>()
  return (
    <RequireVerticalAccess slug={params.slug as VerticalSlug}>
      <VerticalDetailAdminPage />
    </RequireVerticalAccess>
  )
}

function VerticalDetailAdminPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug as VerticalSlug

  const [tab, setTab] = useState<Tab>('overview')
  const [vertical, setVertical] = useState<Vertical | null>(null)
  const [images, setImages] = useState<MediaItem[]>([])
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Vertical>>({})
  const [amenitiesMaster, setAmenitiesMaster] = useState<string[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const [vertRes, mediaImg, mediaVid, bkRes, settingsRes] = await Promise.all([
        fetch(`/api/verticals/${slug}`).then(r => r.json()),
        authedJson<{ media: MediaItem[] }>(`/api/media?verticalSlug=${slug}&section=vertical_gallery`),
        authedJson<{ media: MediaItem[] }>(`/api/media?verticalSlug=${slug}&section=vertical_video`),
        authedJson<{ bookings: Booking[] }>(`/api/bookings?vertical=${slug}`),
        fetch('/api/settings').then(r => r.json()),
      ])
      setVertical(vertRes.vertical)
      setForm(vertRes.vertical)
      setImages(mediaImg.media)
      setVideos(mediaVid.media)
      setBookings(bkRes.bookings)
      setAmenitiesMaster(settingsRes.settings?.amenitiesMaster || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load vertical')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [slug])

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authedJson(`/api/verticals/${slug}`, { method: 'PUT', body: JSON.stringify(form) })
      toast.success('Changes saved! They will reflect on the website.')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleCoverChange = async (result: { url: string; mediaId: string } | null) => {
    try {
      await authedJson(`/api/verticals/${slug}`, {
        method: 'PUT',
        body: JSON.stringify({ coverImageUrl: result?.url || '', coverMediaId: result?.mediaId || null }),
      })
      setVertical(v => v && { ...v, coverImageUrl: result?.url || '', coverMediaId: result?.mediaId || null })
      setForm(f => ({ ...f, coverImageUrl: result?.url || '', coverMediaId: result?.mediaId || null }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update cover image')
    }
  }

  const toggleAmenity = (a: string) => {
    setForm(f => {
      const list = f.amenities || []
      return { ...f, amenities: list.includes(a) ? list.filter(x => x !== a) : [...list, a] }
    })
  }

  const changeBkStatus = async (b: Booking, status: BookingStatus) => {
    await authedJson(`/api/bookings/${b.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    setBookings(bs => bs.map(x => x.id === b.id ? { ...x, status } : x))
  }

  const deleteBk = async (b: Booking) => {
    if (!confirm(`Delete booking from ${b.name}?`)) return
    await authedJson(`/api/bookings/${b.id}`, { method: 'DELETE' })
    setBookings(bs => bs.filter(x => x.id !== b.id))
  }

  useEffect(() => {
    if (vertical?.externalUrl && (tab === 'images' || tab === 'videos' || tab === 'bookings')) setTab('overview')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vertical?.externalUrl])

  if (loading) return <div className="text-center py-8 text-muted text-sm">Loading…</div>
  if (!vertical) return <div className="text-center py-8 text-muted text-sm">Vertical not found.</div>

  const isExternal = !!vertical.externalUrl
  const isExternalForm = !!form.externalUrl
  const visibleTabs: Tab[] = isExternal ? ['overview', 'edit'] : ['overview', 'images', 'videos', 'bookings', 'edit']

  return (
    <div>
      <div className="rounded-xl p-6 mb-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${vertical.color}, ${vertical.color}cc)` }}>
        {vertical.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vertical.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        <div className="relative">
          <div className="text-[.68rem] uppercase tracking-widest text-white/70 mb-1">{vertical.category}</div>
          <div className="text-xl font-bold mb-1">{vertical.name}</div>
          <div className="text-[.78rem] text-white/80 flex items-center gap-2">
            📍 {vertical.location} <StatusDot status={vertical.status === 'live' ? 'on' : 'off'} label={vertical.status === 'live' ? 'Live' : 'Draft'} />
            {isExternal && <Badge variant="blue">External site</Badge>}
          </div>
        </div>
      </div>

      {isExternal && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-[12px] rounded-lg px-4 py-3 mb-4">
          This vertical links out to its own website (<a href={vertical.externalUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">{vertical.externalUrl}</a>). Bookings, images and videos below are optional — the public site sends visitors straight to that URL instead of showing an internal page.
        </div>
      )}

      <div className="flex gap-1 mb-4 border-b border-border flex-wrap">
        {visibleTabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[12px] font-semibold capitalize border-b-2 -mb-px ${tab === t ? 'border-maroon text-maroon' : 'border-transparent text-muted'}`}>
            {t === 'edit' ? 'Edit Info' : t}
            {t === 'images' && images.length > 0 && <span className="ml-1.5 text-[10px] bg-maroon text-white rounded-full px-1.5 py-0.5">{images.length}</span>}
            {t === 'videos' && videos.length > 0 && <span className="ml-1.5 text-[10px] bg-maroon text-white rounded-full px-1.5 py-0.5">{videos.length}</span>}
            {t === 'bookings' && bookings.length > 0 && <span className="ml-1.5 text-[10px] bg-maroon text-white rounded-full px-1.5 py-0.5">{bookings.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && isExternal && (
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="bg-bg rounded-lg py-4 px-4">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Location</div>
              <div className="text-[13px] font-medium">📍 {vertical.location}</div>
            </div>
            <div className="bg-bg rounded-lg py-4 px-4">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Category</div>
              <div className="text-[13px] font-medium">{vertical.category}</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Btn variant="outline" onClick={() => setTab('edit')}>✏️ Edit Info</Btn>
          </div>
        </Card>
      )}

      {tab === 'overview' && !isExternal && (
        <Card>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {vertical.highlights.map((h, i) => (
              <div key={i} className="bg-bg rounded-lg py-4 text-center">
                <div className="text-xl font-bold">{h.value}</div>
                <div className="text-[10px] text-muted uppercase tracking-wider mt-1">{h.label}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Description</div>
          <p className="text-[13px] text-muted leading-relaxed mb-5 whitespace-pre-line">{vertical.about}</p>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Amenities</div>
          <div className="flex flex-wrap gap-2 mb-6">
            {vertical.amenities.map((a, i) => <span key={i} className="bg-bg rounded-full px-3 py-1.5 text-[12px]">{a}</span>)}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Btn variant="gold" onClick={() => setTab('images')}>🖼️ Manage Images</Btn>
            <Btn variant="primary" onClick={() => setTab('bookings')}>📅 View Bookings</Btn>
            <Btn variant="outline" onClick={() => setTab('edit')}>✏️ Edit Info</Btn>
          </div>
        </Card>
      )}

      {tab === 'images' && (
        <Card title={`Images (${images.length})`}>
          <MediaUploader section="vertical_gallery" verticalSlug={slug} accept="image/*" onUploaded={item => setImages(m => [item, ...m])} />
          <div className="mt-3"><MediaGrid items={images} onDeleted={id => setImages(m => m.filter(x => x.id !== id))} /></div>
        </Card>
      )}

      {tab === 'videos' && (
        <Card title={`Videos (${videos.length})`}>
          <MediaUploader section="vertical_video" verticalSlug={slug} accept="video/*" onUploaded={item => setVideos(m => [item, ...m])} />
          <div className="mt-3"><MediaGrid items={videos} onDeleted={id => setVideos(m => m.filter(x => x.id !== id))} /></div>
        </Card>
      )}

      {tab === 'bookings' && (
        <Card noPad>
          {bookings.length === 0 ? (
            <EmptyState icon="📅" text="No bookings for this venue yet." />
          ) : (
            <TableWrap>
              <thead>
                <tr className="border-b border-border">
                  <Th>Name</Th><Th shrink>Phone</Th><Th>Event</Th>
                  <Th shrink>Date</Th><Th align="center" shrink>Guests</Th><Th shrink>Status</Th><Th align="right" shrink>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                    <Td className="font-medium">{b.name}</Td>
                    <Td muted shrink>{b.phone}</Td>
                    <Td>{b.eventType}</Td>
                    <Td shrink>{b.eventDate}</Td>
                    <Td align="center" shrink>{b.guests}</Td>
                    <Td shrink><Badge variant={b.status === 'confirmed' ? 'green' : b.status === 'new' ? 'amber' : b.status === 'cancelled' ? 'red' : 'blue'}>{b.status}</Badge></Td>
                    <Td align="right" shrink>
                      <div className="flex justify-end gap-1">
                        {b.status !== 'confirmed' && <IconBtn icon="✓" label="Confirm booking" variant="green" onClick={() => changeBkStatus(b, 'confirmed')} />}
                        <IconBtn icon="🗑" label="Delete booking" variant="red" onClick={() => deleteBk(b)} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      )}

      {tab === 'edit' && (
        <>
          <Card title="Vertical Image — shown on the homepage brand card and in the admin sidebar">
            <SingleImageField
              currentUrl={vertical.coverImageUrl}
              currentMediaId={vertical.coverMediaId}
              section="vertical_cover"
              verticalSlug={slug}
              onChange={handleCoverChange}
            />
          </Card>

          <Card>
            <form onSubmit={saveEdit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Field label="Vertical Name"><Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
                <Field label="Short Name"><Input value={form.short || ''} onChange={e => setForm(f => ({ ...f, short: e.target.value }))} /></Field>
                <Field label="Location"><Input value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></Field>
                <Field label="Category"><Input value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></Field>
                {!isExternalForm && (
                  <Field label="Tagline"><Input value={form.tagline || ''} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} /></Field>
                )}
                <Field label="Brand Color"><Input type="color" value={form.color || '#1a2d5a'} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} /></Field>
                <Field label="Status">
                  <Select value={form.status || 'live'} onChange={e => setForm(f => ({ ...f, status: e.target.value as Vertical['status'] }))}>
                    <option value="live">Live — Visible on website</option>
                    <option value="draft">Draft — Hidden from website</option>
                  </Select>
                </Field>
                {!isExternalForm && (
                  <>
                    <Field label="Phone Number"><Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></Field>
                    <Field label="WhatsApp Number"><Input value={form.whatsapp || ''} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} /></Field>
                  </>
                )}
              </div>
              {!isExternalForm && (
                <Field label="Google Maps URL"><Input value={form.googleMapsUrl || ''} onChange={e => setForm(f => ({ ...f, googleMapsUrl: e.target.value }))} /></Field>
              )}
              <Field label="External Website URL — leave blank for a normal internal page">
                <Input value={form.externalUrl || ''} onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))} placeholder="https://example.com" />
              </Field>
              {isExternalForm && (
                <div className="text-[11px] text-muted -mt-2 mb-3.5">
                  When set, the website links straight to this URL instead of an internal page — the fields below (tagline, phone, description, highlights, amenities) aren&apos;t shown on the site and are hidden here. Clear this field to restore a normal internal page.
                </div>
              )}
              {!isExternalForm && (
                <>
                  <Field label="Description"><TextArea rows={5} value={form.about || ''} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} /></Field>
                  <Field label="Highlights — one per line, format: value|label (e.g. 500+|Seats)">
                    <TextArea rows={4} value={highlightsToText(form.highlights || [])} onChange={e => setForm(f => ({ ...f, highlights: textToHighlights(e.target.value) }))} />
                  </Field>
                  <Field label="Amenities — tick what's available at this vertical (managed centrally in Site Settings)">
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto border border-border rounded-md p-3">
                      {Array.from(new Set([...amenitiesMaster, ...(form.amenities || [])])).map(a => {
                        const checked = (form.amenities || []).includes(a)
                        return (
                          <label key={a} className={`flex items-center gap-1.5 text-[12px] border rounded-full px-3 py-1.5 cursor-pointer transition-colors ${checked ? 'bg-gold/10 border-gold text-ink' : 'border-border text-muted'}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleAmenity(a)} className="accent-gold" />
                            {a}
                          </label>
                        )
                      })}
                      {amenitiesMaster.length === 0 && (form.amenities || []).length === 0 && (
                        <span className="text-[12px] text-muted">No amenities defined yet — add some in Site Settings → Amenities Master List.</span>
                      )}
                    </div>
                  </Field>
                </>
              )}
              <Btn variant="gold" disabled={saving}>{saving ? 'Saving…' : '💾 Save Changes'}</Btn>
            </form>
          </Card>
        </>
      )}
    </div>
  )
}
