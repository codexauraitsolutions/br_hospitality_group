'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { useStaff } from '@/components/admin/RoleContext'
import { Card, Btn, Badge, Field, Input, Select, Modal, IconBtn, Th, Td, TableWrap, EmptyState, StatusDot } from '@/components/admin/ui'
import { RequireSuperAdmin } from '@/components/admin/RequireRole'
import { StaffUser, StaffRole, Vertical } from '@/types'

export default function StaffPageGuarded() {
  return <RequireSuperAdmin><StaffPage /></RequireSuperAdmin>
}

function StaffPage() {
  const me = useStaff()
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<StaffUser | null>(null)
  const [saving, setSaving] = useState(false)

  const emptyForm = { name: '', email: '', password: '', role: 'manager' as StaffRole, assignedVerticals: [] as string[] }
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowAdd(true) }
  const openEdit = (s: StaffUser) => {
    setEditing(s)
    setForm({ name: s.name, email: s.email, password: '', role: s.role, assignedVerticals: s.assignedVerticals })
    setShowAdd(true)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [staffRes, vertRes] = await Promise.all([
        authedJson<{ staff: StaffUser[] }>('/api/staff'),
        fetch('/api/verticals').then(r => r.json()),
      ])
      setStaff(staffRes.staff)
      setVerticals(vertRes.verticals || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleVertical = (slug: string) => {
    setForm(f => ({
      ...f,
      assignedVerticals: f.assignedVerticals.includes(slug)
        ? f.assignedVerticals.filter(s => s !== slug)
        : [...f.assignedVerticals, slug],
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await authedJson(`/api/staff/${editing.uid}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: form.name, role: form.role, assignedVerticals: form.role === 'manager' ? form.assignedVerticals : [] }),
        })
        toast.success('Staff account updated')
      } else {
        await authedJson('/api/staff', { method: 'POST', body: JSON.stringify(form) })
        toast.success('Staff account created')
      }
      setShowAdd(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save staff account')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (s: StaffUser) => {
    try {
      await authedJson(`/api/staff/${s.uid}`, { method: 'PATCH', body: JSON.stringify({ active: !s.active }) })
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const removeStaff = async (s: StaffUser) => {
    if (!confirm(`Remove ${s.email}? They will lose access immediately.`)) return
    try {
      await authedJson(`/api/staff/${s.uid}`, { method: 'DELETE' })
      toast.success('Staff account removed')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold">Staff Accounts</h1>
          <p className="text-[12px] text-muted">Manage who can access the admin panel and what they can see</p>
        </div>
        <Btn variant="gold" onClick={openAdd}>+ Add Staff</Btn>
      </div>

      <Card noPad>
        {loading ? (
          <div className="text-center py-8 text-muted text-sm">Loading…</div>
        ) : staff.length === 0 ? (
          <EmptyState icon="🧑‍💼" text="No staff accounts yet." />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-border">
                <Th>Name</Th><Th>Email</Th><Th shrink>Role</Th>
                <Th>Verticals</Th><Th shrink>Status</Th><Th align="right" shrink>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.uid} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                  <Td className="font-medium">{s.name}</Td>
                  <Td muted>{s.email}</Td>
                  <Td shrink>
                    <Badge variant={s.role === 'super_admin' ? 'purple' : 'blue'}>{s.role.replace('_', ' ')}</Badge>
                  </Td>
                  <Td muted>
                    {s.role === 'super_admin' ? 'All' : (s.assignedVerticals.join(', ') || '—')}
                  </Td>
                  <Td shrink>
                    <StatusDot status={s.active ? 'on' : 'off'} label={s.active ? 'Active' : 'Disabled'} />
                  </Td>
                  <Td align="right" shrink>
                    {s.uid !== me.uid ? (
                      <div className="flex justify-end gap-1">
                        <IconBtn icon="✏️" label="Edit staff account" onClick={() => openEdit(s)} />
                        <IconBtn icon={s.active ? '⏸' : '▶'} label={s.active ? 'Disable account' : 'Enable account'} onClick={() => toggleActive(s)} />
                        <IconBtn icon="🗑" label="Remove account" variant="red" onClick={() => removeStaff(s)} />
                      </div>
                    ) : (
                      <span className="text-muted text-[11px]">You</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editing ? 'Edit Staff Account' : 'Add Staff Account'}
        footer={<>
          <Btn variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn variant="gold" disabled={saving} onClick={handleSave as unknown as () => void}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Account'}
          </Btn>
        </>}>
        <form onSubmit={handleSave}>
          <Field label="Full Name">
            <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Email">
            <Input type="email" required disabled={!!editing} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </Field>
          {editing && <p className="text-[11px] text-muted -mt-2 mb-3.5">Email can&apos;t be changed here — remove and re-add the account to use a different email.</p>}
          {!editing && (
            <Field label="Temporary Password">
              <Input type="text" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </Field>
          )}
          <Field label="Role">
            <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as StaffRole }))}>
              <option value="manager">Manager (scoped to specific verticals)</option>
              <option value="super_admin">Super Admin (full access)</option>
            </Select>
          </Field>
          {form.role === 'manager' && (
            <Field label="Assigned Verticals">
              <div className="flex flex-wrap gap-2">
                {verticals.map(v => (
                  <label key={v.slug} className="flex items-center gap-1.5 text-[12px] border border-border rounded-md px-2.5 py-1.5 cursor-pointer">
                    <input type="checkbox" checked={form.assignedVerticals.includes(v.slug)} onChange={() => toggleVertical(v.slug)} />
                    {v.icon} {v.short}
                  </label>
                ))}
              </div>
            </Field>
          )}
        </form>
      </Modal>
    </div>
  )
}
