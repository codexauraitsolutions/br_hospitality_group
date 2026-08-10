'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { Card, Btn, Field, Input, TextArea, Modal, IconBtn, EmptyState } from '@/components/admin/ui'
import SingleImageField from '@/components/admin/SingleImageField'
import { RequireSuperAdmin } from '@/components/admin/RequireRole'
import { TeamMember } from '@/types'

const emptyForm = { name: '', role: '', bio: '', photoUrl: '', photoMediaId: null as string | null }

export default function TeamPageGuarded() {
  return <RequireSuperAdmin><TeamPage /></RequireSuperAdmin>
}

function TeamPage() {
  const [items, setItems] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    setLoading(true)
    try {
      const { team } = await authedJson<{ team: TeamMember[] }>('/api/team')
      setItems(team)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (m: TeamMember) => {
    setEditing(m)
    setForm({ name: m.name, role: m.role, bio: m.bio, photoUrl: m.photoUrl || '', photoMediaId: m.photoMediaId })
    setShowForm(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await authedJson(`/api/team/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) })
      } else {
        await authedJson('/api/team', { method: 'POST', body: JSON.stringify(form) })
      }
      toast.success('Saved')
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const remove = async (m: TeamMember) => {
    if (!confirm(`Remove ${m.name} from the team page? This also deletes their photo from S3.`)) return
    try {
      await authedJson(`/api/team/${m.id}`, { method: 'DELETE' })
      toast.success('Removed')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold">Team</h1>
          <p className="text-[12px] text-muted">People shown on the About page — set a role containing &quot;Founder&quot; to feature someone in the dedicated Founder section</p>
        </div>
        <Btn variant="gold" onClick={openNew}>+ Add Team Member</Btn>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <Card><EmptyState icon="👤" text="No team members yet." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(m => (
            <div key={m.id} className="border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 bg-white flex flex-col">
              <div className="flex items-start gap-3 mb-1">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-cream2 flex items-center justify-center text-xl flex-shrink-0">👤</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[13.5px] truncate">{m.name}</div>
                  <div className="text-[11px] text-gold uppercase tracking-wider truncate">{m.role}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <IconBtn icon="✏️" label="Edit team member" onClick={() => openEdit(m)} />
                  <IconBtn icon="🗑" label="Remove team member" variant="red" onClick={() => remove(m)} />
                </div>
              </div>
              <div className="text-[12px] text-muted leading-relaxed mt-2">{m.bio}</div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Team Member' : 'Add Team Member'}
        footer={<><Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn><Btn variant="gold" onClick={save as unknown as () => void}>Save</Btn></>}>
        <form onSubmit={save}>
          <Field label="Name"><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
          <Field label="Role / Title (e.g. Founder & CEO)"><Input required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></Field>
          <Field label="Bio"><TextArea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></Field>
          <Field label="Photo">
            <SingleImageField
              currentUrl={form.photoUrl}
              currentMediaId={form.photoMediaId}
              section="team"
              aspect="aspect-square"
              onChange={result => setForm(f => ({ ...f, photoUrl: result?.url || '', photoMediaId: result?.mediaId || null }))}
            />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
