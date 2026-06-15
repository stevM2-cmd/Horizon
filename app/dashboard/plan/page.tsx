'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ACTIONS } from '@/lib/constants'
import { Zap } from 'lucide-react'

const CATS = ['Tout', 'Gestion technique', 'Éclairage', 'Chauffage', 'Production', 'Enveloppe']
const STATUS_LABELS: Record<string, string> = { todo: 'À faire', in_progress: 'En cours', done: 'Terminé' }

function PlanContent() {
  const searchParams = useSearchParams()
  const siteId = parseInt(searchParams.get('site') || '0')
  const [filter, setFilter] = useState('Tout')
  const [statuses, setStatuses] = useState<Record<number, string>>(
    Object.fromEntries(ACTIONS.map(a => [a.id, 'todo']))
  )

  const filtered = filter === 'Tout' ? ACTIONS : ACTIONS.filter(a => a.cat === filter)
  const totalImpact = filtered.reduce((s, a) => s + a.impact, 0)
  const totalCee = filtered.reduce((s, a) => s + a.cee, 0)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={20} color="var(--primary)" /> Plan d'action
        </h1>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
          {filtered.length} actions · −{totalImpact}% potentiel · {totalCee.toLocaleString()} MWh CEE
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={filter === c ? 'bp' : 'bg'}
            style={{ padding: '6px 14px', fontSize: 12 }}>{c}</button>
        ))}
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Réduction potentielle</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>−{totalImpact}%</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>CEE mobilisables</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{(totalCee / 1000).toFixed(1)} GWh</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>TRI moyen</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {filtered.length ? (filtered.reduce((s, a) => s + a.tri, 0) / filtered.length).toFixed(1) : '—'} ans
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(a => (
          <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className={`tag ${a.urg === 'urgent' ? 'tag-red' : a.urg === 'medium' ? 'tag-yellow' : 'tag-gray'}`}>{a.urg}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--muted)' }}>
                <span>{a.cat}</span>
                <span>TRI : {a.tri} ans</span>
                <span>Impact : −{a.impact}%</span>
                {a.cee > 0 && <span>{a.cee.toLocaleString()} MWh CEE</span>}
              </div>
            </div>
            <select value={statuses[a.id]} onChange={e => setStatuses(p => ({ ...p, [a.id]: e.target.value }))}
              style={{ width: 'auto', padding: '6px 10px' }}>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PlanPage() {
  return <Suspense fallback={<div />}><PlanContent /></Suspense>
}
