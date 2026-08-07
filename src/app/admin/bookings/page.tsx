'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { Card, StatCard, Btn, Badge, IconBtn, Th, Td, TableWrap, EmptyState } from '@/components/admin/ui'
import { Booking, BookingStatus } from '@/types'

const STATUS_VARIANT: Record<BookingStatus, 'amber' | 'green' | 'blue' | 'red'> = {
  new: 'amber', confirmed: 'green', completed: 'blue', cancelled: 'red',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | BookingStatus>('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { bookings } = await authedJson<{ bookings: Booking[] }>('/api/bookings')
      setBookings(bookings)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const changeStatus = async (b: Booking, status: BookingStatus) => {
    try {
      await authedJson(`/api/bookings/${b.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setBookings(bs => bs.map(x => x.id === b.id ? { ...x, status } : x))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const remove = async (b: Booking) => {
    if (!confirm(`Delete booking from ${b.name}?`)) return
    try {
      await authedJson(`/api/bookings/${b.id}`, { method: 'DELETE' })
      setBookings(bs => bs.filter(x => x.id !== b.id))
      toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const exportCSV = () => {
    if (!bookings.length) { toast.error('No bookings to export'); return }
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Vertical', 'Event', 'Date', 'Guests', 'Status', 'Booked On', 'Message']
    const rows = bookings.map(b => [b.id, b.name, b.phone, b.email, b.verticalSlug, b.eventType, b.eventDate, b.guests, b.status, b.createdAt, b.message]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'BR_Bookings.csv'
    a.click()
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const counts = {
    new: bookings.filter(b => b.status === 'new').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold">Bookings</h1>
          <p className="text-[12px] text-muted">Enquiries submitted through each venue&apos;s booking form</p>
        </div>
        <Btn variant="outline" onClick={exportCSV}>⬇ Export CSV</Btn>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Total Bookings" value={loading ? '…' : bookings.length} icon="📅" accent="blue" />
        <StatCard label="New" value={loading ? '…' : counts.new} tag={counts.new ? 'Action needed' : undefined} tagVariant="amber" icon="🆕" accent="amber" />
        <StatCard label="Confirmed" value={loading ? '…' : counts.confirmed} icon="✓" accent="green" />
        <StatCard label="Completed" value={loading ? '…' : counts.completed} icon="🏁" accent="purple" />
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'new', 'confirmed', 'completed', 'cancelled'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${filter === s ? 'bg-maroon text-white border-maroon' : 'border-border text-muted hover:border-ink/20'}`}>
            {s}
          </button>
        ))}
      </div>

      <Card noPad>
        {loading ? (
          <div className="text-center py-8 text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📅" text="No bookings yet." />
        ) : (
          <TableWrap>
            <thead>
              <tr className="border-b border-border">
                <Th>Name</Th><Th shrink>Phone</Th><Th shrink>Vertical</Th>
                <Th>Event</Th><Th shrink>Date</Th><Th align="center" shrink>Guests</Th>
                <Th shrink>Status</Th><Th align="right" shrink>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                  <Td className="font-medium">{b.name}</Td>
                  <Td muted shrink>{b.phone}</Td>
                  <Td muted shrink>{b.verticalSlug}</Td>
                  <Td>{b.eventType}</Td>
                  <Td shrink>{b.eventDate}</Td>
                  <Td align="center" shrink>{b.guests}</Td>
                  <Td shrink><Badge variant={STATUS_VARIANT[b.status]}>{b.status}</Badge></Td>
                  <Td align="right" shrink>
                    <div className="flex justify-end gap-1">
                      {b.status !== 'confirmed' && <IconBtn icon="✓" label="Confirm booking" variant="green" onClick={() => changeStatus(b, 'confirmed')} />}
                      <IconBtn icon="🗑" label="Delete booking" variant="red" onClick={() => remove(b)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  )
}
