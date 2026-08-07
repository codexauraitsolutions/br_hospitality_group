'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { authedJson } from '@/lib/apiClient'
import { StaffUser } from '@/types'
import { RoleContext } from '@/components/admin/RoleContext'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffUser | null>(null)
  const [ready, setReady] = useState(false)
  const [configError, setConfigError] = useState('')

  useEffect(() => {
    let auth
    try {
      auth = getFirebaseAuth()
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Firebase is not configured')
      return
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login')
        return
      }
      try {
        const { staff } = await authedJson<{ staff: StaffUser }>('/api/auth/me')
        setStaff(staff)
        setReady(true)
      } catch {
        // Token valid but no active staff record — not authorized for the admin panel.
        await signOut(auth)
        router.replace('/login')
      }
    }, (err) => {
      setConfigError(err.message)
    })
    return () => unsub()
  }, [router])

  if (configError) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-3xl mb-1">⚠️</div>
        <div className="text-white text-sm font-semibold">Firebase isn&apos;t configured yet</div>
        <div className="text-white/40 text-[12px] max-w-sm">
          Follow <code className="text-gold">FIREBASE_SETUP.md</code> to create your Firebase project and fill in <code className="text-gold">.env.local</code>, then restart the app.
        </div>
      </div>
    )
  }

  if (!ready || !staff) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <svg viewBox="0 0 60 60" width="44" height="44" className="animate-spin">
          <circle cx="30" cy="30" r="24" fill="none" stroke="#c9a84c" strokeWidth="3" strokeDasharray="110 40" strokeLinecap="round" />
        </svg>
        <div className="text-white/30 text-[11px] tracking-[3px] uppercase">Checking access...</div>
      </div>
    )
  }

  return <RoleContext.Provider value={staff}>{children}</RoleContext.Provider>
}
