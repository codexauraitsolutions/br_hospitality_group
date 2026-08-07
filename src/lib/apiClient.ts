'use client'
// Thin fetch wrapper that attaches the current Firebase user's ID token
// as a Bearer header, for calling protected /api/* routes from the admin panel.
import { getFirebaseAuth } from '@/lib/firebase'

export async function authedFetch(input: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser
  const token = user ? await user.getIdToken() : null

  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type') && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, { ...init, headers })
}

export async function authedJson<T = unknown>(input: string, init: RequestInit = {}): Promise<T> {
  const res = await authedFetch(input, init)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || `Request failed (${res.status})`)
  return data
}
