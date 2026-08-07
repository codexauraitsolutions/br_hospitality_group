'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { Card, StatCard, Btn, Badge, Modal, TextArea, IconBtn, Th, Td, TableWrap, EmptyState } from '@/components/admin/ui'
import { RequireSuperAdmin } from '@/components/admin/RequireRole'
import { Enquiry, EnquiryStatus } from '@/types'

const STATUS_VARIANT: Record<EnquiryStatus, 'amber' | 'blue' | 'green'> = { new: 'amber', read: 'blue', replied: 'green' }

export default function EnquiriesPageGuarded() {
  return <RequireSuperAdmin><EnquiriesPage /></RequireSuperAdmin>
}

function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Enquiry | null>(null)
  const [notes, setNotes] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { enquiries } = await authedJson<{ enquiries: Enquiry[] }>('/api/enquiries')
      setEnquiries(enquiries)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const open = (e: Enquiry) => {
    setActive(e)
    setNotes(e.adminNotes)
    if (e.status === 'new') updateStatus(e, 'read', true)
  }

  const updateStatus = async (e: Enquiry, status: EnquiryStatus, silent = false) => {
    try {
      await authedJson(`/api/enquiries/${e.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setEnquiries(list => list.map(x => x.id === e.id ? { ...x, status } : x))
      if (!silent) toast.success(`Marked as ${status}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const saveNotes = async () => {
    if (!active) return
    try {
      await authedJson(`/api/enquiries/${active.id}`, { method: 'PATCH', body: JSON.stringify({ adminNotes: notes }) })
      setEnquiries(list => list.map(x => x.id === active.id ? { ...x, adminNotes: notes } : x))
      toast.success('Notes saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const remove = async (e: Enquiry) => {
    if (!confirm(`Delete enquiry from ${e.name}?`)) return
    try {
      await authedJson(`/api/enquiries/${e.id}`, { method: 'DELETE' })
      setEnquiries(list => list.filter(x => x.id !== e.id))
      setActive(null)
      toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const counts = {
    new: enquiries.filter(e => e.status === 'new').length,
    read: enquiries.filter(e => e.status === 'read').length,
    replied: enquiries.filter(e => e.status === 'replied').length,
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold">Enquiries</h1>
        <p className="text-[12px] text-muted">Submissions from the general Contact page form</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Total Enquiries" value={loading ? '…' : enquiries.length} icon="📩" accent="blue" />
        <StatCard label="New" value={loading ? '…' : counts.new} tag={counts.new ? 'Action needed' : undefined} tagVariant="red" icon="🆕" accent="red" />
        <StatCard label="Read" value={loading ? '…' : counts.read} icon="👁️" accent="amber" />
        <StatCard label="Replied" value={loading ? '…' : counts.replied} icon="✓" accent="green" />
      </div>

      <Card noPad>
        {loading ? (
          <div className="text-center py-8 text-muted text-sm">Loading…</div>
        ) : enquiries.length === 0 ? (
          <EmptyState icon="📩" text="No enquiries yet." />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-border">
                <Th>Name</Th><Th shrink>Phone</Th><Th shrink>Venue</Th>
                <Th>Event Type</Th><Th shrink>Status</Th><Th align="right" shrink>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map(e => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                  <Td className="font-medium">{e.name}</Td>
                  <Td muted shrink>{e.phone}</Td>
                  <Td muted shrink>{e.venueSlug}</Td>
                  <Td>{e.eventType || '—'}</Td>
                  <Td shrink><Badge variant={STATUS_VARIANT[e.status]}>{e.status}</Badge></Td>
                  <Td align="right" shrink>
                    <div className="flex justify-end">
                      <IconBtn icon="👁️" label="View enquiry" onClick={() => open(e)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <Modal open={!!active} onClose={() => setActive(null)} title="Enquiry Details"
        footer={active && <>
          <Btn variant="red" onClick={() => remove(active)}>🗑 Delete</Btn>
          <Btn variant="green" onClick={() => updateStatus(active, 'replied')}>✓ Mark Replied</Btn>
        </>}>
        {active && (
          <div className="text-[13px]">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><div className="text-[10px] text-muted uppercase">Name</div><div>{active.name}</div></div>
              <div><div className="text-[10px] text-muted uppercase">Phone</div><div>{active.phone}</div></div>
              <div><div className="text-[10px] text-muted uppercase">Email</div><div>{active.email || '—'}</div></div>
              <div><div className="text-[10px] text-muted uppercase">Venue</div><div>{active.venueSlug}</div></div>
              <div><div className="text-[10px] text-muted uppercase">Event Type</div><div>{active.eventType || '—'}</div></div>
              <div><div className="text-[10px] text-muted uppercase">Submitted</div><div>{new Date(active.createdAt).toLocaleString()}</div></div>
            </div>
            <div className="mb-4">
              <div className="text-[10px] text-muted uppercase mb-1">Message</div>
              <div className="bg-bg rounded-md p-3 leading-relaxed">{active.message}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase mb-1">Admin Notes</div>
              <TextArea rows={3} value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
