'use client'
import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem('br_sidebar_collapsed') === '1')
    setReady(true)
  }, [])

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem('br_sidebar_collapsed', c ? '0' : '1')
      return !c
    })
  }

  return (
    <div className={`min-h-screen bg-bg font-inter flex ${!ready ? 'invisible' : ''}`}>
      <AdminSidebar collapsed={collapsed} onToggle={toggle} />
      <main className={`flex-1 min-h-screen transition-[margin] duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
