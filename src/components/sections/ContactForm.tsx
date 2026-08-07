'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Vertical } from '@/types'

const EVENT_TYPES = ['Wedding / Reception', 'Corporate Event', 'Birthday Celebration', 'Anniversary', 'Farm Stay / Outing', 'Catering Only', 'Other Enquiry']

export default function ContactForm({ verticals }: { verticals: Vertical[] }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', venueSlug: 'general', eventType: '', message: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || "Thanks! We'll be in touch soon.")
        setForm({ name: '', phone: '', email: '', venueSlug: 'general', eventType: '', message: '' })
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full box-border bg-transparent border-0 border-b border-border py-3 text-sm outline-none focus:border-gold transition-colors'

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-6">
      <div>
        <label className="block text-[10px] tracking-[.2em] uppercase text-muted mb-1.5">Your Name *</label>
        <input required className={inputClass} placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-[10px] tracking-[.2em] uppercase text-muted mb-1.5">Phone *</label>
        <input required type="tel" className={inputClass} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </div>
      <div>
        <label className="block text-[10px] tracking-[.2em] uppercase text-muted mb-1.5">Email</label>
        <input type="email" className={inputClass} placeholder="Your email" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      <div>
        <label className="block text-[10px] tracking-[.2em] uppercase text-muted mb-1.5">Venue</label>
        <select className={inputClass} value={form.venueSlug} onChange={e => set('venueSlug', e.target.value)}>
          <option value="general">General Enquiry</option>
          {verticals.map(v => <option key={v.slug} value={v.slug}>{v.name}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-[10px] tracking-[.2em] uppercase text-muted mb-1.5">Event Type</label>
        <select className={inputClass} value={form.eventType} onChange={e => set('eventType', e.target.value)}>
          <option value="">Select event type</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-[10px] tracking-[.2em] uppercase text-muted mb-1.5">Message *</label>
        <textarea required rows={3} className={inputClass + ' resize-none'} placeholder="Tell us about your requirements, expected date, number of guests, etc."
          value={form.message} onChange={e => set('message', e.target.value)} />
      </div>
      <div className="md:col-span-2 flex gap-3 flex-wrap mt-2">
        <button type="submit" disabled={loading}
          className="bg-gold text-white text-[.72rem] font-semibold uppercase tracking-wider px-6 py-3.5 rounded disabled:opacity-50">
          {loading ? 'Sending…' : '📤 Send Message'}
        </button>
      </div>
    </form>
  )
}
