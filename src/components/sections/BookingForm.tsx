'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { VerticalSlug } from '@/types'

const EVENT_TYPES = ['Wedding / Reception', 'Corporate Event', 'Birthday Celebration', 'Anniversary', 'Conference / Meeting', 'Farm Stay / Outing', 'Catering Only', 'Other']

export default function BookingForm({ verticalSlug }: { verticalSlug: VerticalSlug }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', eventDate: '', guests: '', eventType: '', message: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, verticalSlug }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Enquiry sent! We'll reply within 2 hours. 🎉")
        setForm({ name: '', phone: '', email: '', eventDate: '', guests: '', eventType: '', message: '' })
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full box-border border border-border rounded-md px-3.5 py-2.5 text-[13px] outline-none focus:border-gold transition-colors bg-white'

  return (
    <div id="booking" className="bg-cream2 border border-border rounded-xl p-6 md:p-8">
      <div className="font-serif text-xl font-semibold mb-1">Book This Venue</div>
      <p className="text-[.76rem] text-muted mb-5">We reply within 2 hours · No advance payment to enquire</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <input required placeholder="Full name" className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} />
        <input required type="tel" placeholder="Phone" className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} />
        <input type="email" placeholder="Email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} />
        <input required type="date" className={inputClass} value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
        <input required type="number" min={1} placeholder="Guest count" className={inputClass} value={form.guests} onChange={e => set('guests', e.target.value)} />
        <select required className={inputClass} value={form.eventType} onChange={e => set('eventType', e.target.value)}>
          <option value="">Select event type</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <textarea placeholder="Menu preferences, décor, special requests…" rows={3}
          className={inputClass + ' sm:col-span-2 resize-none'} value={form.message} onChange={e => set('message', e.target.value)} />
        <button type="submit" disabled={loading}
          className="sm:col-span-2 bg-gold text-white text-[.72rem] font-semibold uppercase tracking-wider py-3.5 rounded-md disabled:opacity-50">
          {loading ? 'Sending…' : '📅 Send Enquiry'}
        </button>
      </form>
    </div>
  )
}
