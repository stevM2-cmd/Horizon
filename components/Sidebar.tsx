'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LayoutDashboard, Zap, Users, Shield, FileText, TrendingUp, Settings, LogOut, Building2, CreditCard } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { href: '/dashboard/plan', label: 'Plan d\'action', icon: Zap },
  { href: '/dashboard/locataires', label: 'Locataires', icon: Users },
  { href: '/dashboard/bacs', label: 'Décret BACS', icon: Shield },
  { href: '/dashboard/documents', label: 'Documents IA', icon: FileText },
  { href: '/dashboard/financement', label: 'Financement', icon: TrendingUp },
]

interface Props {
  currentSite: number
  onSiteChange: (id: number) => void
  sites: any[]
  globalView: boolean
  onGlobalToggle: () => void
}

export default function Sidebar({ currentSite, onSiteChange, sites, globalView, onGlobalToggle }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '4px 8px', marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>HorizonEnergie</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Conformité tertiaire</div>
      </div>

      {/* Site selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, padding: '0 8px' }}>
          Site actif
        </div>
        <button
          onClick={onGlobalToggle}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: globalView ? 'rgba(0,226,158,.1)' : 'transparent',
            color: globalView ? 'var(--primary)' : 'var(--muted)',
            fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 500, marginBottom: 4,
            transition: 'all .15s',
          }}
        >
          <Building2 size={14} />
          Vision patrimoine
        </button>
        {sites.map(s => (
          <button
            key={s.id}
            onClick={() => { onSiteChange(s.id); if (globalView) onGlobalToggle() }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: !globalView && currentSite === s.id ? 'rgba(255,255,255,.06)' : 'transparent',
              color: !globalView && currentSite === s.id ? 'var(--text)' : 'var(--muted)',
              fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 500,
              transition: 'all .15s', textAlign: 'left',
            }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: !globalView && currentSite === s.id ? 'var(--primary)' : 'var(--border)',
              flexShrink: 0,
            }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
          </button>
        ))}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, padding: '0 8px' }}>
          Navigation
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(0,226,158,.1)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--muted)',
                fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: active ? 600 : 400,
                transition: 'all .15s', marginBottom: 2, textAlign: 'left',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Bottom links */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button
          onClick={() => router.push('/dashboard/parametres')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: pathname.startsWith('/dashboard/parametres') ? 'rgba(255,255,255,.06)' : 'transparent',
            color: 'var(--muted)', fontFamily: 'Sora, sans-serif', fontSize: 13,
            transition: 'all .15s',
          }}
        >
          <Settings size={16} />
          Paramètres
        </button>
        <button
          onClick={logout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--muted)',
            fontFamily: 'Sora, sans-serif', fontSize: 13, transition: 'all .15s',
          }}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
