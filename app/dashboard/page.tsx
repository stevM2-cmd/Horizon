'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { SITES, ACTIONS, DEADLINES, BACS_DATA } from '@/lib/constants'
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react'

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030]
const TARGETS = [0, 8, 16, 24, 32, 40]

function DashboardContent() {
  const searchParams = useSearchParams()
  const siteId = parseInt(searchParams.get('site') || '0')
  const site = SITES[siteId] || SITES[0]
  const bacs = BACS_DATA[siteId] || BACS_DATA[0]

  const currentGap = 40 - site.red
  const totalCee = ACTIONS.reduce((s, a) => s + a.cee, 0)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>{site.name}</h1>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{site.address} · Zone {site.zone} · {site.surf}</div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: `3px solid ${currentGap > 20 ? 'var(--danger)' : currentGap > 10 ? 'var(--warn)' : 'var(--primary)'}` }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Réduction actuelle</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>−{site.red}%</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Objectif 2030 : −40%</div>
          <div className="bar" style={{ marginTop: 10 }}>
            <div className="bar-fill" style={{ width: `${site.red / 40 * 100}%`, background: 'var(--primary)' }} />
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Conso. actuelle</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{site.conso}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>kWh/m²/an · Réf. {site.ref}</div>
          <div className="bar" style={{ marginTop: 10 }}>
            <div className="bar-fill" style={{ width: `${site.conso / site.ref * 100}%`, background: 'var(--secondary)' }} />
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>CEE mobilisables</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{(totalCee / 1000).toFixed(0)} GWh</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>cumac — 6ème période</div>
        </div>
        <div className="card" style={{ borderLeft: `3px solid ${bacs.statut === 'non_conforme' ? 'var(--danger)' : 'var(--warn)'}` }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Classe BACS</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: bacs.statut === 'non_conforme' ? 'var(--danger)' : 'var(--warn)' }}>
            Classe {bacs.classe_globale}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {bacs.statut === 'non_conforme' ? '⚠ Non conforme' : 'En cours de mise à niveau'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Trajectory */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15 }}>Trajectoire OPERAT</h3>
            <span className="tag tag-yellow">−{currentGap}% à combler</span>
          </div>
          <div style={{ position: 'relative', height: 160 }}>
            <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="none">
              <polyline points={YEARS.map((_, i) => `${i * 80},${160 - TARGETS[i] * 3}`).join(' ')}
                fill="none" stroke="rgba(0,226,158,.3)" strokeWidth="2" strokeDasharray="6,3" />
              <polyline points={`0,${160 - site.red * 3} 80,${160 - site.red * 2.2} 160,${160 - site.red * 1.5}`}
                fill="none" stroke="var(--secondary)" strokeWidth="2" />
              {[0, 10, 20, 30, 40].map(v => (
                <line key={v} x1="0" y1={160 - v * 3} x2="400" y2={160 - v * 3}
                  stroke="rgba(255,255,255,.05)" strokeWidth="1" />
              ))}
            </svg>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
              {YEARS.map(y => <span key={y} style={{ fontSize: 10, color: 'var(--muted)' }}>{y}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
              <div style={{ width: 20, height: 2, background: 'rgba(0,226,158,.5)', borderRadius: 1 }} />Objectif
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
              <div style={{ width: 20, height: 2, background: 'var(--secondary)', borderRadius: 1 }} />Projection
            </div>
          </div>
        </div>

        {/* Deadlines */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Échéances réglementaires</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DEADLINES.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
                <div style={{ color: d.t === 'high' ? 'var(--danger)' : 'var(--warn)' }}>
                  {d.t === 'high' ? <AlertTriangle size={16} /> : <Clock size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{d.date}</div>
                </div>
                <span className={`tag ${d.t === 'high' ? 'tag-red' : 'tag-yellow'}`}>J−{d.days}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15 }}>Plan d'actions prioritaires</h3>
          <a href={`/dashboard/plan?site=${siteId}`} style={{ textDecoration: 'none' }}>
            <button className="bg" style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
              Voir tout <ChevronRight size={14} />
            </button>
          </a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ACTIONS.slice(0, 4).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
              <span className={`tag ${a.urg === 'urgent' ? 'tag-red' : a.urg === 'medium' ? 'tag-yellow' : 'tag-gray'}`}>{a.urg}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{a.cat}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12 }}>
                <div style={{ color: 'var(--primary)' }}>−{a.impact}%</div>
                <div style={{ color: 'var(--muted)', marginTop: 2 }}>TRI {a.tri} ans</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12 }}>
                <div>{a.cee.toLocaleString()}</div>
                <div style={{ color: 'var(--muted)', marginTop: 2 }}>MWh cumac</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div />}>
      <DashboardContent />
    </Suspense>
  )
}
