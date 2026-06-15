'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar'
import { SITES } from '@/lib/constants'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSite = parseInt(searchParams.get('site') || '0')
  const globalView = searchParams.get('global') === '1'

  const setSite = (id: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('site', String(id))
    params.delete('global')
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleGlobal = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (globalView) {
      params.delete('global')
    } else {
      params.set('global', '1')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        currentSite={currentSite}
        onSiteChange={setSite}
        sites={SITES}
        globalView={globalView}
        onGlobalToggle={toggleGlobal}
      />
      <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }} />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  )
}
