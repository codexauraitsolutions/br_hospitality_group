'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authedJson } from '@/lib/apiClient'
import { Card, Btn, Field, Input, TextArea } from '@/components/admin/ui'
import { RequireSuperAdmin } from '@/components/admin/RequireRole'
import { SiteSettings } from '@/types'

export default function SeoPageGuarded() {
  return <RequireSuperAdmin><SeoPage /></RequireSuperAdmin>
}

function SeoPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { if (d.success) setSettings(d.settings) })
  }, [])

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await authedJson('/api/settings', { method: 'PUT', body: JSON.stringify(settings) })
      toast.success('SEO settings saved!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <div className="text-center py-8 text-muted text-sm">Loading…</div>

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setSettings(s => s && ({ ...s, [k]: v }))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold">SEO &amp; Meta</h1>
          <p className="text-[12px] text-muted">How the site appears in search engines</p>
        </div>
        <Btn variant="gold" disabled={saving} onClick={save}>{saving ? 'Saving…' : '💾 Save'}</Btn>
      </div>

      <Card>
        <Field label="Homepage Title Tag"><Input value={settings.seoTitle} onChange={e => set('seoTitle', e.target.value)} /></Field>
        <Field label="Meta Description"><TextArea rows={3} value={settings.seoDescription} onChange={e => set('seoDescription', e.target.value)} /></Field>
        <Field label="Keywords (comma separated)"><Input value={settings.seoKeywords} onChange={e => set('seoKeywords', e.target.value)} /></Field>
        <Field label="Google Analytics ID"><Input value={settings.gaId} onChange={e => set('gaId', e.target.value)} placeholder="G-XXXXXXXXXX" /></Field>
        <Field label="Search Console Verification"><Input value={settings.searchConsoleVerification} onChange={e => set('searchConsoleVerification', e.target.value)} /></Field>
      </Card>
    </div>
  )
}
