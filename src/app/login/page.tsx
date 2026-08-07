'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { if (d.success) setLogoUrl(d.settings.logoUrl) }).catch(() => {})
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const auth = getFirebaseAuth()
      await signOut(auth).catch(() => {})
      const cred = await signInWithEmailAndPassword(auth, email, password)
      if (cred.user) {
        router.push('/admin/dashboard')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message.replace('Firebase: ', '').replace(/\s*\(auth\/[^)]+\)\.?/, ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden font-inter">
      <div className="absolute -top-52 -left-52 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,45,90,0.25) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-52 -right-52 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)' }} />

      <div className="w-full max-w-[440px] bg-[#111] border border-white/10 rounded-2xl p-12 relative z-10">
        <div className="text-center mb-9">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="w-14 h-14 mx-auto mb-3.5 object-contain" />
          ) : (
            <div className="w-14 h-14 mx-auto mb-3.5 rounded-lg bg-[#1a2d5a] border border-gold/30 flex items-center justify-center text-gold font-serif text-xl font-semibold">
              BR
            </div>
          )}
          <div className="text-gold font-bold tracking-[5px] text-[17px]">BR HOSPITALITY</div>
          <div className="text-white/25 text-[10px] tracking-[5px] uppercase mt-1">Group · Admin</div>
          <div className="w-9 h-px bg-gold/25 mx-auto mt-3.5" />
        </div>

        <h1 className="text-[#FAF8F4] text-xl font-medium text-center mb-1.5 font-serif">Admin Login</h1>
        <p className="text-white/30 text-[13px] text-center mb-8">Sign in to manage your properties</p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-white/40 text-[11px] tracking-[2px] uppercase mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@brhospitality.com"
              className="w-full box-border bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[#FAF8F4] text-sm outline-none focus:border-gold transition-colors" />
          </div>

          <div className="mb-6">
            <label className="block text-white/40 text-[11px] tracking-[2px] uppercase mb-2">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full box-border bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-11 text-[#FAF8F4] text-sm outline-none focus:border-gold transition-colors" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 text-base bg-transparent border-none cursor-pointer">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 text-red-400 text-[13px]">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gold hover:brightness-95 disabled:opacity-40 rounded-lg text-[#0A0A0A] font-bold text-[13px] tracking-[2px] uppercase transition-all">
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  )
}
