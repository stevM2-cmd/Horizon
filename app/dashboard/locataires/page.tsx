'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TENANTS, SITES } from '@/lib/constants'
import { Users, Mail, CheckCircle2, Clock, XCircle } from 'lucide-react'

const CONSENT_CFG: Record<string, any> = {
  granted: { label: 'Accordé', cls: 'tag-green' },
  pending: { label: 'En attente', cls: 'tag-yellow' },
  refused: { label: 'Refusé', cls: 'tag-red' },
  owner: { label: 'Propriétaire', cls: 'tag-blue' },
  'n/a': { label: 'N/A', cls: 'tag-gray' },
}

function LocatairesContent() {
  const searchParams = useSearchParams()
  const siteId = parseInt(searchParams.get('site') || '0')
  const [sending, setSending] = useState<string | null>(null)
  const tenants = TENANTS[siteId] || []

  const locataires = tenants.filter(t => t.role === 'locataire')
  const granted = locataires.filter(t => t.consent === 'granted').length
  const surface_covered = tenants.filter(t => ['granted', 'owner'].includes(t.consent)).reduce((s, t) => s + t.surface, 0)
  const total_surface = tenants.reduce((s, t) => s + t.surface, 0)

  const sendEmail = async (tenant: any) => {
    setSending(tenant.id)
    await new Promise(r => setTimeout(r, 1200))
    setSending(null)
    alert(`Email ENEDIS envoyé à ${tenant.email}`)
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={20} color="var(--primary)" /> Locataires & Consentements
        </h1>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{SITES[siteId]?.name} · Gestion PRM et collecte ENEDIS</div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Consentements accordés</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{granted}/{locataires.length}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>locataires actifs</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Surface couverte</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{Math.round(surface_covered / total_surface * 100)}%</div>
          <div className="bar" style={{ marginTop: 10 }}>
            <div className="bar-fill" style={{ width: `${surface_covered / total_surface * 100}%`, background: 'var(--primary)' }} />
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>En attente de réponse</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warn)' }}>
            {locataires.filter(t => t.consent === 'pending').length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>relance recommandée</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Étage', 'Société', 'Surface', 'PRM', 'Consentement', 'Conso.', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map((t, i) => {
              const cfg = CONSENT_CFG[t.consent] || CONSENT_CFG['n/a']
              return (
                <tr key={t.id} style={{ borderBottom: i < tenants.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)' }}>{t.floor}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{t.company}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12 }}>{t.surface} m²</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, fontFamily: 'monospace', color: 'var(--muted)' }}>{t.prm || '—'}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`tag ${cfg.cls}`}>{cfg.label}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 12 }}>
                    {t.conso ? `${(t.conso / 1000).toFixed(1)} MWh` : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {t.role === 'locataire' && t.consent === 'pending' && t.email && (
                      <button className="bg" onClick={() => sendEmail(t)} disabled={sending === t.id}
                        style={{ padding: '5px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={12} />{sending === t.id ? 'Envoi...' : 'Relancer'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function LocatairesPage() {
  return <Suspense fallback={<div />}><LocatairesContent /></Suspense>
}
