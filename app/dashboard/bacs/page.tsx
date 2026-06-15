'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BACS_DATA, CLASSE_CFG, SITES } from '@/lib/constants'
import { Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

const TABS = ['Diagnostic', 'Systèmes', 'Feuille de route', 'ROI']

function BacsContent() {
  const searchParams = useSearchParams()
  const siteId = parseInt(searchParams.get('site') || '0')
  const [tab, setTab] = useState(0)
  const bacs = BACS_DATA[siteId] || BACS_DATA[0]
  const cfg = CLASSE_CFG[bacs.classe_globale]
  const cfgObj = CLASSE_CFG[bacs.objectif_classe]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={20} color="var(--primary)" /> Décret BACS
        </h1>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
          {SITES[siteId]?.name} · Régulation n°2020-887 — Diagnostic et mise en conformité
        </div>
      </div>

      <div className="card" style={{
        marginBottom: 20, borderLeft: `4px solid ${bacs.statut === 'non_conforme' ? 'var(--danger)' : 'var(--warn)'}`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ color: bacs.statut === 'non_conforme' ? 'var(--danger)' : 'var(--warn)' }}>
          {bacs.statut === 'non_conforme' ? <XCircle size={24} /> : <AlertTriangle size={24} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{bacs.statut === 'non_conforme' ? 'Non conforme — Action requise' : 'Mise à niveau en cours'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Échéance : {bacs.echeance} · Classe actuelle {bacs.classe_globale} → Objectif {bacs.objectif_classe}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{bacs.capex_estime.toLocaleString()} €</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>CAPEX estimé</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--secondary)' }}>{(bacs.cee_estime / 1000).toFixed(0)} GWh</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>CEE mobilisables</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t, i) => (
          <button key={i} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Classe actuelle</h3>
            <div style={{ padding: 24, borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: cfg.color }}>{bacs.classe_globale}</div>
              <div style={{ fontSize: 13, color: cfg.color, marginTop: 8 }}>{cfg.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{cfg.desc}</div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Classe objectif</h3>
            <div style={{ padding: 24, borderRadius: 12, background: cfgObj.bg, border: `1px solid ${cfgObj.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: cfgObj.color }}>{bacs.objectif_classe}</div>
              <div style={{ fontSize: 13, color: cfgObj.color, marginTop: 8 }}>{cfgObj.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Économie estimée : {bacs.economie_estimee_pct}%</div>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.values(bacs.systemes).filter((s: any) => s.kw > 0).map((s: any) => {
            const sCfg = s.classe ? CLASSE_CFG[s.classe] : null
            const checks = [s.has_regulation, s.has_programmation, s.has_monitoring, s.has_telereleve]
            const checkLabels = ['Régulation', 'Programmation', 'Monitoring', 'Télé-relève']
            return (
              <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.kw} kW</span>
                    {sCfg && <span className="tag" style={{ background: sCfg.bg, color: sCfg.color }}>Classe {s.classe}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {checkLabels.map((l, i) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                        {checks[i] ? <CheckCircle2 size={14} color="var(--primary)" /> : <XCircle size={14} color="var(--danger)" />}
                        <span style={{ color: checks[i] ? 'var(--text)' : 'var(--muted)' }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: 1, label: 'Audit complet des installations', desc: 'Inventaire des équipements, état de la régulation', done: true },
            { step: 2, label: 'Installation GTB centrale', desc: 'Gestion technique du bâtiment — classe B minimum', done: false },
            { step: 3, label: 'Régulation chauffage/clim', desc: 'Sonde extérieure, régulation PID, programmation horaire', done: false },
            { step: 4, label: 'Monitoring et reporting', desc: 'Compteurs connectés, dashboard temps réel, alertes', done: false },
            { step: 5, label: `Certification classe ${bacs.objectif_classe}`, desc: 'Dossier technique, attestation bureau de contrôle agréé', done: false },
          ].map(item => (
            <div key={item.step} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: item.done ? 'rgba(0,226,158,.15)' : 'rgba(255,255,255,.05)',
                border: `2px solid ${item.done ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.done ? 'var(--primary)' : 'var(--muted)', fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}>
                {item.done ? <CheckCircle2 size={16} /> : item.step}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 3 && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Analyse financière</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'CAPEX estimé', value: `${bacs.capex_estime.toLocaleString()} €` },
                { label: 'CEE mobilisables', value: `${(bacs.cee_estime / 1000).toFixed(0)} GWh cumac` },
                { label: 'Économie annuelle', value: `${Math.round(bacs.capex_estime * bacs.economie_estimee_pct / 100 / 10).toLocaleString()} €/an` },
                { label: 'TRI estimé', value: `${Math.round(bacs.capex_estime / (bacs.capex_estime * bacs.economie_estimee_pct / 100 / 10))} ans` },
                { label: 'Réduction conso.', value: `−${bacs.economie_estimee_pct}%` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Financement disponible</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'CEE (6ème période)', amount: Math.round(bacs.cee_estime * 0.005), desc: 'Valorisation à ~0,5 c€/kWh cumac' },
                { label: "MaPrimeRénov' Tertiaire", amount: Math.round(bacs.capex_estime * 0.20), desc: "Subvention jusqu'à 20% du CAPEX" },
                { label: 'Éco-prêt collectif', amount: Math.round(bacs.capex_estime * 0.30), desc: 'Taux 0% sur 10 ans' },
              ].map(f => (
                <div key={f.label} style={{ padding: 12, background: 'rgba(0,226,158,.05)', border: '1px solid rgba(0,226,158,.1)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>+{f.amount.toLocaleString()} €</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BacsPage() {
  return <Suspense fallback={<div />}><BacsContent /></Suspense>
}
