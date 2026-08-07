'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authedJson } from '@/lib/apiClient'
import { useStaff } from '@/components/admin/RoleContext'
import { Card, StatCard, Btn, Badge, IconBtn, Th, Td, TableWrap, EmptyState, StatusDot } from '@/components/admin/ui'
import { Booking, Vertical, Enquiry, ActivityEntry } from '@/types'

const ACTIVITY_ICON: Record<ActivityEntry['type'], string> = {
  upload: '⬆️', edit: '✏️', delete: '🗑️', enquiry: '📩', booking: '📅',
}
const ACTIVITY_COLOR: Record<ActivityEntry['type'], string> = {
  upload: 'bg-blue-100 text-info', edit: 'bg-amber-100 text-warn', delete: 'bg-red-100 text-danger',
  enquiry: 'bg-purple-100 text-accent', booking: 'bg-green-100 text-ok',
}

export default function DashboardPage() {
  const staff = useStaff()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAll = async () => {
      const tasks: Promise<void>[] = [
        authedJson<{ bookings: Booking[] }>('/api/bookings').then(d => setBookings(d.bookings)),
        fetch('/api/verticals').then(r => r.json()).then(d => {
          const list: Vertical[] = staff.role === 'super_admin' ? d.verticals : d.verticals.filter((v: Vertical) => staff.assignedVerticals.includes(v.slug))
          setVerticals(list)
        }),
        authedJson<{ activity: ActivityEntry[] }>('/api/activity').then(d => setActivity(d.activity)),
      ]
      if (staff.role === 'super_admin') {
        tasks.push(authedJson<{ enquiries: Enquiry[] }>('/api/enquiries').then(d => setEnquiries(d.enquiries)))
      }
      await Promise.allSettled(tasks)
      setLoading(false)
    }
    loadAll()
  }, [staff])

  const newBookings = bookings.filter(b => b.status === 'new').length
  const newEnquiries = enquiries.filter(e => e.status === 'new').length

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold">Welcome, {staff.name.split(' ')[0] || staff.email}</h1>
        <p className="text-[13px] text-muted">
          {staff.role === 'super_admin' ? 'Full overview across all verticals' : `Showing your assigned venues: ${verticals.map(v => v.short).join(', ')}`}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Total Bookings" value={loading ? '…' : bookings.length} tag={newBookings ? `${newBookings} new` : undefined} tagVariant="amber" icon="📅" accent="blue" />
        <StatCard label="Verticals" value={loading ? '…' : verticals.length} tag={staff.role === 'super_admin' ? 'All Live' : 'Assigned'} tagVariant="blue" icon="🏨" accent="purple" />
        {staff.role === 'super_admin' && (
          <StatCard label="New Enquiries" value={loading ? '…' : newEnquiries} tag={newEnquiries ? 'Action needed' : 'All caught up'} tagVariant={newEnquiries ? 'red' : 'green'} icon="📩" accent={newEnquiries ? 'red' : 'amber'} />
        )}
        <StatCard label="Confirmed Bookings" value={loading ? '…' : bookings.filter(b => b.status === 'confirmed').length} tagVariant="green" icon="✓" accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        <div>
          <Card title="Recent Bookings" noPad action={<Link href="/admin/bookings"><Btn variant="outline">View All →</Btn></Link>}>
            {bookings.length === 0 ? (
              <div className="p-5"><EmptyState icon="📅" text="No bookings yet." /></div>
            ) : (
              <TableWrap>
                <thead>
                  <tr className="border-b border-border">
                    <Th>Name</Th><Th shrink>Vertical</Th><Th shrink>Date</Th><Th shrink>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map(b => (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                      <Td className="font-medium">{b.name}</Td>
                      <Td muted shrink>{b.verticalSlug}</Td>
                      <Td shrink>{b.eventDate}</Td>
                      <Td shrink><Badge variant={b.status === 'confirmed' ? 'green' : b.status === 'new' ? 'amber' : 'blue'}>{b.status}</Badge></Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Card>

          <Card title="Verticals Overview" noPad>
            <TableWrap>
              <thead>
                <tr className="border-b border-border">
                  <Th>Vertical</Th><Th>Location</Th><Th align="center" shrink>Bookings</Th><Th shrink>Status</Th><Th align="right" shrink>Open</Th>
                </tr>
              </thead>
              <tbody>
                {verticals.map(v => (
                  <tr key={v.slug} className="border-b border-border last:border-0 hover:bg-bg/50 transition-colors">
                    <Td className="font-medium">
                      <div className="flex items-center gap-2">
                        {v.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.coverImageUrl} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
                        ) : (
                          <span className="w-6 h-6 rounded flex-shrink-0" style={{ background: v.color }} />
                        )}
                        {v.short}
                      </div>
                    </Td>
                    <Td muted>{v.location}</Td>
                    <Td align="center" shrink><Badge variant="blue">{bookings.filter(b => b.verticalSlug === v.slug).length}</Badge></Td>
                    <Td shrink><StatusDot status={v.status === 'live' ? 'on' : 'off'} label={v.status} /></Td>
                    <Td align="right" shrink>
                      <div className="flex justify-end">
                        <Link href={`/admin/verticals/${v.slug}`}><IconBtn icon="→" label={`Open ${v.name}`} /></Link>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Card>
        </div>

        <div>
          <Card title="Recent Activity">
            {activity.length === 0 ? (
              <EmptyState icon="🕘" text="No activity yet." />
            ) : (
              <div className="flex flex-col gap-3.5">
                {activity.map(a => (
                  <div key={a.id} className="flex gap-3 text-[12px]">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] flex-shrink-0 ${ACTIVITY_COLOR[a.type]}`}>
                      {ACTIVITY_ICON[a.type]}
                    </span>
                    <div className="min-w-0">
                      <div className="text-ink leading-snug">{a.message}</div>
                      <div className="text-[10px] text-muted mt-0.5">{new Date(a.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Quick Actions">
            <div className="flex flex-col gap-2">
              <Link href="/admin/media"><Btn variant="outline" className="w-full justify-center">⬆ Upload Media</Btn></Link>
              <Link href="/admin/bookings"><Btn variant="outline" className="w-full justify-center">📅 Manage Bookings</Btn></Link>
              {staff.role === 'super_admin' && <Link href="/admin/enquiries"><Btn variant="outline" className="w-full justify-center">📩 View Enquiries</Btn></Link>}
              <Link href="/" target="_blank"><Btn variant="outline" className="w-full justify-center">🌐 Preview Website</Btn></Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
