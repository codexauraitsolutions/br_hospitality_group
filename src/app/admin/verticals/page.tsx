'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { RequireSuperAdmin } from '@/components/admin/RequireRole'
import { Btn, Badge, Field, Input, Modal, StatusDot } from '@/components/admin/ui'
import { Vertical } from '@/types'

export default function VerticalsListPageGuarded() {
  return <RequireSuperAdmin><VerticalsListPage /></RequireSuperAdmin>
}

const emptyForm = { slug: '', name: '', short: '', location: '', category: '' }

function VerticalsListPage() {
  const router = useRouter()
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/verticals').then(r => r.json())
      setVerticals(res.verticals || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const slug = slugify(form.slug || form.name)
      if (!slug) throw new Error('Enter a name or slug')
      await authedJson('/api/verticals', { method: 'POST', body: JSON.stringify({ ...form, slug }) })
      toast.success('Vertical created — add details, a cover image and highlights on its Edit Info tab')
      setShowForm(false)
      setForm(emptyForm)
      router.push(`/admin/verticals/${slug}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create vertical')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (v: Vertical) => {
    const nextStatus = v.status === 'live' ? 'draft' : 'live'
    try {
      await authedJson(`/api/verticals/${v.slug}`, { method: 'PUT', body: JSON.stringify({ name: v.name, status: nextStatus }) })
      setVerticals(list => list.map(x => x.slug === v.slug ? { ...x, status: nextStatus } : x))
      toast.success(nextStatus === 'live' ? 'Vertical activated — now visible on the website' : 'Vertical deactivated — hidden from the website')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold">All Verticals</h1>
          <p className="text-[12px] text-muted">Create new properties and control which ones are live on the website</p>
        </div>
        <Btn variant="gold" onClick={() => setShowForm(true)}>+ Add Vertical</Btn>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted text-sm">Loading…</div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map(v => (
              <div key={v.slug} className="border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                <div className="h-32 flex items-center justify-center text-3xl relative"
                  style={{ background: v.coverImageUrl ? undefined : `linear-gradient(135deg, ${v.color}, ${v.color}cc)` }}>
                  {v.coverImageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={v.coverImageUrl} alt={v.name} className="w-full h-full object-cover" />
                    : <span className="text-white">{v.icon}</span>}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {v.externalUrl && <Badge variant="blue">External</Badge>}
                    <StatusDot status={v.status === 'live' ? 'on' : 'off'} label={v.status === 'live' ? 'Live on website' : 'Draft — hidden from website'} />
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-semibold text-[13.5px] mb-0.5">{v.name}</div>
                  <div className="text-[11px] text-muted mb-3.5">📍 {v.location}</div>
                  <div className="flex gap-1.5">
                    <Link href={`/admin/verticals/${v.slug}`} className="flex-1"><Btn variant="outline" className="w-full justify-center">⚙️ Manage</Btn></Link>
                    <Btn variant={v.status === 'live' ? 'outline' : 'green'} onClick={() => toggleStatus(v)}>
                      {v.status === 'live' ? '⏸ Deactivate' : '▶ Activate'}
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Vertical"
        footer={<><Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn><Btn variant="gold" disabled={saving} onClick={create as unknown as () => void}>{saving ? 'Creating…' : 'Create'}</Btn></>}>
        <form onSubmit={create}>
          <Field label="Name"><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} /></Field>
          <Field label="URL Slug (used in links, e.g. /venues/your-slug)">
            <Input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} />
          </Field>
          <Field label="Short Name"><Input value={form.short} onChange={e => setForm(f => ({ ...f, short: e.target.value }))} /></Field>
          <Field label="Location"><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></Field>
          <Field label="Category"><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Resort · Farm Stay" /></Field>
        </form>
      </Modal>
    </div>
  )
}
