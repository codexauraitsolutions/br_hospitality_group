'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { Card, Btn, Badge, Field, Input, TextArea, Select, Modal, IconBtn, Th, Td, TableWrap, EmptyState, StatusDot } from '@/components/admin/ui'
import { RequireSuperAdmin } from '@/components/admin/RequireRole'
import { Testimonial, Vertical } from '@/types'

const emptyForm = { name: '', role: '', quote: '', rating: 5, verticalSlug: '', showOnHome: false }

export default function TestimonialsPageGuarded() {
  return <RequireSuperAdmin><TestimonialsPage /></RequireSuperAdmin>
}

function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    setLoading(true)
    try {
      const [{ testimonials }, vertRes] = await Promise.all([
        authedJson<{ testimonials: Testimonial[] }>('/api/testimonials'),
        fetch('/api/verticals').then(r => r.json()),
      ])
      setItems(testimonials)
      setVerticals(vertRes.verticals || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({ name: t.name, role: t.role, quote: t.quote, rating: t.rating, verticalSlug: t.verticalSlug || '', showOnHome: t.showOnHome })
    setShowForm(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...form, verticalSlug: form.verticalSlug || null }
      if (editing) {
        await authedJson(`/api/testimonials/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await authedJson('/api/testimonials', { method: 'POST', body: JSON.stringify(payload) })
      }
      toast.success('Saved')
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const toggleActive = async (t: Testimonial) => {
    await authedJson(`/api/testimonials/${t.id}`, { method: 'PATCH', body: JSON.stringify({ active: !t.active }) })
    load()
  }

  const remove = async (t: Testimonial) => {
    if (!confirm(`Delete testimonial from ${t.name}?`)) return
    try {
      await authedJson(`/api/testimonials/${t.id}`, { method: 'DELETE' })
      toast.success('Deleted')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold">Testimonials</h1>
          <p className="text-[12px] text-muted">Guest reviews shown on the homepage and venue pages</p>
        </div>
        <Btn variant="gold" onClick={openNew}>+ Add Testimonial</Btn>
      </div>

      <Card noPad>
        {loading ? (
          <div className="text-center py-8 text-muted text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <EmptyState icon="💬" text="No testimonials yet." />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-border">
                <Th shrink>Name</Th><Th>Quote</Th><Th shrink>Vertical</Th>
                <Th align="center" shrink>Home?</Th><Th shrink>Status</Th><Th align="right" shrink>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                  <Td className="font-medium" shrink>{t.name}</Td>
                  <Td muted className="max-w-xs truncate">{t.quote}</Td>
                  <Td muted shrink>{t.verticalSlug || '—'}</Td>
                  <Td align="center" shrink>{t.showOnHome ? <Badge variant="green">Yes</Badge> : <Badge>No</Badge>}</Td>
                  <Td shrink><StatusDot status={t.active ? 'on' : 'off'} label={t.active ? 'Active' : 'Hidden'} /></Td>
                  <Td align="right" shrink>
                    <div className="flex justify-end gap-1">
                      <IconBtn icon="✏️" label="Edit testimonial" onClick={() => openEdit(t)} />
                      <IconBtn icon={t.active ? '🙈' : '👁️'} label={t.active ? 'Hide testimonial' : 'Show testimonial'} onClick={() => toggleActive(t)} />
                      <IconBtn icon="🗑" label="Delete testimonial" variant="red" onClick={() => remove(t)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Testimonial' : 'Add Testimonial'}
        footer={<><Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn><Btn variant="gold" onClick={save as unknown as () => void}>Save</Btn></>}>
        <form onSubmit={save}>
          <Field label="Guest Name"><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
          <Field label="Role / Context (e.g. Wedding, Lush Castle Resort)"><Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></Field>
          <Field label="Quote"><TextArea required rows={3} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} /></Field>
          <Field label="Rating">
            <Select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
            </Select>
          </Field>
          <Field label="Related Vertical (optional)">
            <Select value={form.verticalSlug} onChange={e => setForm(f => ({ ...f, verticalSlug: e.target.value }))}>
              <option value="">None</option>
              {verticals.map(v => <option key={v.slug} value={v.slug}>{v.short}</option>)}
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={form.showOnHome} onChange={e => setForm(f => ({ ...f, showOnHome: e.target.checked }))} />
            Show on homepage
          </label>
        </form>
      </Modal>
    </div>
  )
}
