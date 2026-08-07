'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedFetch, authedJson } from '@/lib/apiClient'
import { Card, Btn, Field, Input, TextArea } from '@/components/admin/ui'
import { RequireSuperAdmin } from '@/components/admin/RequireRole'
import SingleImageField from '@/components/admin/SingleImageField'
import { SiteSettings, IconCard, ServiceItem } from '@/types'

function cardsToText(items: IconCard[]) { return items.map(i => `${i.icon}|${i.title}|${i.text}`).join('\n') }
function textToCards(text: string): IconCard[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const [icon, title, ...rest] = line.split('|')
    return { icon: (icon || '').trim(), title: (title || '').trim(), text: rest.join('|').trim() }
  })
}
function servicesToText(items: ServiceItem[]) { return items.map(i => `${i.icon}|${i.label}`).join('\n') }
function textToServices(text: string): ServiceItem[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const [icon, ...rest] = line.split('|')
    return { icon: (icon || '').trim(), label: rest.join('|').trim() }
  })
}

export default function SettingsPageGuarded() {
  return <RequireSuperAdmin><SettingsPage /></RequireSuperAdmin>
}

function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [backingUp, setBackingUp] = useState(false)

  const downloadBackup = async () => {
    setBackingUp(true)
    try {
      const res = await authedFetch('/api/backup')
      if (!res.ok) throw new Error('Backup failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `br-hospitality-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Backup downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Backup failed')
    } finally {
      setBackingUp(false)
    }
  }

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { if (d.success) setSettings(d.settings) })
  }, [])

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await authedJson('/api/settings', { method: 'PUT', body: JSON.stringify(settings) })
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = async (result: { url: string; mediaId: string } | null) => {
    try {
      await authedJson('/api/settings', { method: 'PUT', body: JSON.stringify({ logoUrl: result?.url || '', logoMediaId: result?.mediaId || null }) })
      setSettings(s => s && ({ ...s, logoUrl: result?.url || '', logoMediaId: result?.mediaId || null }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update logo')
    }
  }

  if (!settings) return <div className="text-center py-8 text-muted text-sm">Loading…</div>

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setSettings(s => s && ({ ...s, [k]: v }))
  const setStat = (group: 'homeStats' | 'aboutStats', k: string, v: string) =>
    setSettings(s => s && ({ ...s, [group]: { ...s[group], [k]: v } }))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold">Site Settings</h1>
          <p className="text-[12px] text-muted">Edit the content shown across the public website</p>
        </div>
        <Btn variant="gold" disabled={saving} onClick={save}>{saving ? 'Saving…' : '💾 Save Changes'}</Btn>
      </div>

      <Card title="Database Backup">
        <p className="text-[12px] text-muted mb-3.5 leading-relaxed">
          Download a full snapshot of every record in the database (verticals, bookings, enquiries, testimonials, team, settings, staff, media metadata, activity log) as a single JSON file. Uploaded photos and videos stay safely in S3 and aren&apos;t re-downloaded here — only their URLs are included.
        </p>
        <Btn variant="outline" disabled={backingUp} onClick={downloadBackup}>
          {backingUp ? 'Preparing…' : '⬇ Download Backup (.json)'}
        </Btn>
      </Card>

      <Card title="Site Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Site Name"><Input value={settings.siteName} onChange={e => set('siteName', e.target.value)} /></Field>
          <Field label="Tagline"><Input value={settings.tagline} onChange={e => set('tagline', e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="Logo — shown in the navigation, footer, and admin panel">
        <SingleImageField
          currentUrl={settings.logoUrl}
          currentMediaId={settings.logoMediaId}
          section="logo"
          onChange={handleLogoChange}
          aspect="aspect-[3/1]"
          fit="contain"
        />
      </Card>

      <Card title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Field label="Contact Phone"><Input value={settings.phone1} onChange={e => set('phone1', e.target.value)} /></Field>
          <Field label="Secondary Phone"><Input value={settings.phone2} onChange={e => set('phone2', e.target.value)} /></Field>
          <Field label="WhatsApp Number"><Input value={settings.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="91XXXXXXXXXX" /></Field>
          <Field label="Contact Email"><Input value={settings.email} onChange={e => set('email', e.target.value)} /></Field>
        </div>
        <Field label="Address"><Input value={settings.address} onChange={e => set('address', e.target.value)} /></Field>
        <Field label="Google Maps Embed URL"><Input value={settings.mapsEmbedUrl} onChange={e => set('mapsEmbedUrl', e.target.value)} /></Field>
      </Card>

      <Card title="Social Links">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
          <Field label="Instagram URL"><Input value={settings.instagram} onChange={e => set('instagram', e.target.value)} /></Field>
          <Field label="Facebook URL"><Input value={settings.facebook} onChange={e => set('facebook', e.target.value)} /></Field>
          <Field label="YouTube URL"><Input value={settings.youtube} onChange={e => set('youtube', e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="Homepage Stats Band">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
          <Field label="Years"><Input value={settings.homeStats.years} onChange={e => setStat('homeStats', 'years', e.target.value)} /></Field>
          <Field label="Happy Guests"><Input value={settings.homeStats.guests} onChange={e => setStat('homeStats', 'guests', e.target.value)} /></Field>
          <Field label="Venues"><Input value={settings.homeStats.venues} onChange={e => setStat('homeStats', 'venues', e.target.value)} /></Field>
          <Field label="Max Guests"><Input value={settings.homeStats.maxGuests} onChange={e => setStat('homeStats', 'maxGuests', e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="About Page Stats Band">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
          <Field label="Founded (Year)"><Input value={settings.aboutStats.founded} onChange={e => setStat('aboutStats', 'founded', e.target.value)} /></Field>
          <Field label="Venues"><Input value={settings.aboutStats.venues} onChange={e => setStat('aboutStats', 'venues', e.target.value)} /></Field>
          <Field label="Happy Guests"><Input value={settings.aboutStats.guests} onChange={e => setStat('aboutStats', 'guests', e.target.value)} /></Field>
          <Field label="Events Per Year"><Input value={settings.aboutStats.eventsPerYear} onChange={e => setStat('aboutStats', 'eventsPerYear', e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="About Page Intro">
        <Field label="Intro Title"><Input value={settings.aboutIntroTitle} onChange={e => set('aboutIntroTitle', e.target.value)} /></Field>
        <Field label="Paragraph 1"><TextArea rows={3} value={settings.aboutIntroText1} onChange={e => set('aboutIntroText1', e.target.value)} /></Field>
        <Field label="Paragraph 2"><TextArea rows={3} value={settings.aboutIntroText2} onChange={e => set('aboutIntroText2', e.target.value)} /></Field>
      </Card>

      <Card title="Tagline Band">
        <Field label="Text shown in the gold band on the homepage"><Input value={settings.taglineband} onChange={e => set('taglineband', e.target.value)} /></Field>
      </Card>

      <Card title="Services Strip">
        <Field label="One per line, format: icon|label">
          <TextArea rows={6} value={servicesToText(settings.servicesStrip)} onChange={e => set('servicesStrip', textToServices(e.target.value))} />
        </Field>
      </Card>

      <Card title="Why Choose Us Cards">
        <Field label="One per line, format: icon|title|text">
          <TextArea rows={6} value={cardsToText(settings.whyChooseUs)} onChange={e => set('whyChooseUs', textToCards(e.target.value))} />
        </Field>
      </Card>

      <Card title="Our Values Cards">
        <Field label="One per line, format: icon|title|text">
          <TextArea rows={8} value={cardsToText(settings.values)} onChange={e => set('values', textToCards(e.target.value))} />
        </Field>
      </Card>

      <Card title="Amenities Master List">
        <Field label="One per line — this is the list every vertical picks from on its Edit Info tab (e.g. 🍽️ Multi-cuisine Menu)">
          <TextArea rows={10} value={settings.amenitiesMaster.join('\n')}
            onChange={e => set('amenitiesMaster', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
        </Field>
      </Card>

      <div className="flex justify-end">
        <Btn variant="gold" disabled={saving} onClick={save}>{saving ? 'Saving…' : '💾 Save Changes'}</Btn>
      </div>
    </div>
  )
}
