'use client'
import { useState } from 'react'
import { SITES, ACTIONS, BACS_DATA } from '@/lib/constants'
import { TrendingUp, Euro, Calculator, FileText, Info } from 'lucide-react'

const TABS = ['Simulation CEE', 'CPE / Tiers-investisseur', 'MaPrimeRénov\'', 'Synthèse']

const CEE_PRICE_PER_MWH = 0.005 // €/kWh cumac = 5€/MWh cumac

function TooltipInfo({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Info size={13} color="var(--muted)" style={{ cursor: 'pointer' }}
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} />
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: '#1a2535', border: '1px solid var(--border)', borderRadius: 8,
          padding: '8px 12px', fontSize: 11, color: 'var(--text)', width: 200,
          zIndex: 10, marginBottom: 6, lineHeight: 1.5,
        }}>
          {text}
        </div>
      )}
    </div>
  )
}

export default function FinancementPage() {
  const [siteId, setSiteId] = useState(0)
  const [tab, setTab] = useState(0)

  // CEE simulation state
  const [ceePrice, setCeePrice] = useState(0.5) // c€/kWh cumac
  const [selectedActions, setSelectedActions] = useState<number[]>(ACTIONS.map(a => a.id))

  // CPE state
  const [cpeType, setCpeType] = useState<'cpe' | 'tiers'>('cpe')
  const [cpeDuration, setCpeDuration] = useState(10)
  const [cpeGarantie, setCpeGarantie] = useState(20)

  // MaPrimeRénov state
  const [capex, setCapex] = useState(BACS_DATA[siteId].capex_estime)

  const site = SITES[siteId]
  const bacs = BACS_DATA[siteId]

  const filteredActions = ACTIONS.filter(a => selectedActions.includes(a.id))
  const totalCeeKwh = filteredActions.reduce((s, a) => s + a.cee, 0) * 1000 // MWh → kWh
  const totalCeeEuros = Math.round(totalCeeKwh * (ceePrice / 100))
  const totalCapex = Math.round(ACTIONS.filter(a => selectedActions.includes(a.id)).reduce((s, a) => s + (a.cee * 30), 10000))

  const annualSavings = Math.round(site.ref * parseFloat(site.surf.replace(/[^0-9]/g, '')) * cpeGarantie / 100 * 0.15)
  const cpeRevenue = annualSavings * cpeDuration
  const netCapex = totalCapex - totalCeeEuros

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={20} color="var(--primary)" /> Financement & Aides
          </h1>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
            Simulation CEE, CPE, MaPrimeRénov' Tertiaire — 6ème période
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SITES.map(s => (
            <button key={s.id} onClick={() => { setSiteId(s.id); setCapex(BACS_DATA[s.id].capex_estime) }}
              className={siteId === s.id ? 'bp' : 'bg'} style={{ padding: '7px 14px', fontSize: 12 }}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>CEE mobilisables</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
            {totalCeeEuros.toLocaleString()} €
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            {(totalCeeKwh / 1000).toFixed(0)} GWh cumac
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>MaPrimeRénov'</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {Math.round(capex * 0.20).toLocaleString()} €
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Jusqu'à 20% du CAPEX</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>CAPEX net aides</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {Math.max(0, netCapex - Math.round(capex * 0.20)).toLocaleString()} €
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Après CEE + MaPrimeRénov'</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>TRI moyen</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {(ACTIONS.reduce((s, a) => s + a.tri, 0) / ACTIONS.length).toFixed(1)} ans
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Portefeuille d'actions</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t, i) => (
          <button key={i} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* ── TAB 0: CEE ── */}
      {tab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14 }}>Actions éligibles CEE</h3>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {selectedActions.length}/{ACTIONS.length} sélectionnées
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ACTIONS.map(a => (
                  <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedActions.includes(a.id)}
                      onChange={e => setSelectedActions(p => e.target.checked ? [...p, a.id] : p.filter(id => id !== a.id))}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{a.cat} · TRI {a.tri} ans</div>
                    </div>
                    {a.cee > 0 ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                          {Math.round(a.cee * (ceePrice / 100) * 1000).toLocaleString()} €
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.cee.toLocaleString()} MWh</div>
                      </div>
                    ) : (
                      <span className="tag tag-gray">Non éligible</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, marginBottom: 16 }}>Paramètres CEE</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Prix de vente CEE
                      <TooltipInfo text="Prix du marché OTC entre 0,3 et 0,8 c€/kWh cumac. Négocier avec un acheteur obligé avant travaux." />
                    </label>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                      {ceePrice} c€/kWh
                    </span>
                  </div>
                  <input type="range" min="0.2" max="0.8" step="0.05" value={ceePrice}
                    onChange={e => setCeePrice(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                    <span>0,2 c€ (marché bas)</span><span>0,8 c€ (marché haut)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 14, marginBottom: 16 }}>Résultat simulation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Volume CEE total', value: `${(totalCeeKwh / 1000).toFixed(1)} GWh cumac` },
                  { label: 'Valorisation CEE', value: `${totalCeeEuros.toLocaleString()} €`, highlight: true },
                  { label: 'CAPEX brut estimé', value: `${totalCapex.toLocaleString()} €` },
                  { label: 'CAPEX net CEE', value: `${Math.max(0, totalCapex - totalCeeEuros).toLocaleString()} €` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: row.highlight ? 'var(--primary)' : 'var(--text)' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <button className="bp" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                onClick={() => alert('Dossier CEE transmis à votre conseiller HorizonEnergie')}>
                <FileText size={14} /> Préparer dossier CEE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1: CPE ── */}
      {tab === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, marginBottom: 16 }}>Type de montage</h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {[
                  { id: 'cpe', label: 'CPE — Contrat de Performance Énergétique', desc: 'Garantie de résultats portée par un prestataire. Investissement partagé.' },
                  { id: 'tiers', label: 'Tiers-investisseur', desc: 'Financement 100% externe. Remboursement sur les économies d\'énergie réalisées.' },
                ].map(t => (
                  <button key={t.id} onClick={() => setCpeType(t.id as any)}
                    style={{
                      flex: 1, padding: '16px', borderRadius: 10, border: `2px solid ${cpeType === t.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: cpeType === t.id ? 'rgba(0,226,158,.06)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: cpeType === t.id ? 'var(--primary)' : 'var(--text)', marginBottom: 6 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Durée du contrat ({cpeDuration} ans)
                  </label>
                  <input type="range" min="5" max="20" step="1" value={cpeDuration}
                    onChange={e => setCpeDuration(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Garantie performance ({cpeGarantie}%)
                  </label>
                  <input type="range" min="10" max="40" step="5" value={cpeGarantie}
                    onChange={e => setCpeGarantie(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 14, marginBottom: 16 }}>Fonctionnement du montage</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(cpeType === 'cpe' ? [
                  { step: '1', label: 'Appel d\'offres CPE', desc: 'Sélection d\'un prestataire certifié CPE (ESCO)' },
                  { step: '2', label: 'Audit préalable', desc: 'Baseline énergétique certifiée par bureau de contrôle' },
                  { step: '3', label: 'Réalisation travaux', desc: 'Financement partagé propriétaire / prestataire' },
                  { step: '4', label: 'Garantie de résultats', desc: `${cpeGarantie}% d'économies garanties sur ${cpeDuration} ans` },
                ] : [
                  { step: '1', label: 'Dossier tiers-investisseur', desc: 'Présentation du projet à un financeur (banque verte, fonds)' },
                  { step: '2', label: 'Financement 100% externe', desc: 'Zéro mise de fonds du propriétaire' },
                  { step: '3', label: 'Remboursement sur économies', desc: `Durée de remboursement : ${cpeDuration} ans` },
                  { step: '4', label: 'Bénéfice net post-remboursement', desc: `100% des économies après ${cpeDuration} ans` },
                ]).map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(0,226,158,.1)', border: '1px solid rgba(0,226,158,.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
                    }}>{item.step}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Projection financière</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Économies annuelles estimées', value: `${annualSavings.toLocaleString()} €/an`, highlight: true },
                { label: `Cumul sur ${cpeDuration} ans`, value: `${cpeRevenue.toLocaleString()} €` },
                { label: 'Garantie de performance', value: `${cpeGarantie}%` },
                { label: 'CAPEX total', value: `${totalCapex.toLocaleString()} €` },
                { label: 'CEE mobilisables', value: `${totalCeeEuros.toLocaleString()} €` },
                { label: 'Investissement net', value: `${Math.max(0, totalCapex - totalCeeEuros).toLocaleString()} €` },
                { label: 'ROI sur durée contrat', value: `×${(cpeRevenue / Math.max(1, totalCapex - totalCeeEuros)).toFixed(1)}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: row.highlight ? 'var(--primary)' : 'var(--text)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Bar chart savings vs investment */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Cumul économies vs investissement</div>
              <div style={{ position: 'relative', height: 80 }}>
                {Array.from({ length: Math.min(cpeDuration, 10) }).map((_, i) => {
                  const year = i + 1
                  const cumSavings = annualSavings * year
                  const inv = totalCapex - totalCeeEuros
                  const pct = Math.min(100, (cumSavings / Math.max(1, inv)) * 100)
                  return (
                    <div key={year} style={{ position: 'absolute', bottom: 0, left: `${i * 10}%`, width: '8%' }}>
                      <div style={{ height: `${pct}%`, background: pct >= 100 ? 'var(--primary)' : 'var(--secondary)', borderRadius: '2px 2px 0 0', minHeight: 2 }} />
                    </div>
                  )
                })}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                <span>Année 1</span><span>Année {Math.min(cpeDuration, 10)}</span>
              </div>
            </div>

            <button className="bp" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => alert('Mise en contact avec un partenaire CPE/tiers-investisseur en cours...')}>
              <Euro size={14} /> Contacter un partenaire financement
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: MaPrimeRénov' ── */}
      {tab === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, marginBottom: 4 }}>MaPrimeRénov' Tertiaire</h3>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7 }}>
                Aide de l'ANAH pour les travaux de rénovation énergétique des bâtiments tertiaires.
                Cumulable avec les CEE et l'éco-prêt à taux zéro collectif.
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  CAPEX travaux éligibles (€)
                </label>
                <input type="number" value={capex} onChange={e => setCapex(parseInt(e.target.value) || 0)}
                  style={{ maxWidth: 240 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'GTB / automatisation', pct: 25, max: 50000, desc: 'Classe B minimum obligatoire' },
                  { label: 'Isolation thermique', pct: 20, max: 80000, desc: 'Toiture, murs, planchers bas' },
                  { label: 'Système de chauffage', pct: 20, max: 60000, desc: 'Pompe à chaleur, biomasse' },
                  { label: 'Ventilation VMC double flux', pct: 15, max: 30000, desc: 'Rendement ≥75%' },
                ].map(item => {
                  const aid = Math.min(item.max, Math.round(capex * (item.pct / 100)))
                  return (
                    <div key={item.label} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.desc}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{aid.toLocaleString()} €</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.pct}% — plafond {item.max.toLocaleString()} €</div>
                        </div>
                      </div>
                      <div className="bar">
                        <div className="bar-fill" style={{ width: `${(aid / item.max) * 100}%`, background: 'var(--primary)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 14, marginBottom: 16 }}>Éco-prêt à taux zéro collectif</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Montant max', value: '100 000 €' },
                  { label: 'Taux', value: '0%' },
                  { label: 'Durée max', value: '15 ans' },
                  { label: 'Cumulable CEE', value: 'Oui' },
                ].map(item => (
                  <div key={item.label} style={{ flex: '1 1 100px', padding: '12px', background: 'rgba(0,191,212,.05)', border: '1px solid rgba(0,191,212,.15)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--secondary)' }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Cumul des aides</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'CEE (à prix moyen 0,5 c€)', value: totalCeeEuros, color: 'var(--primary)' },
                { label: 'MaPrimeRénov\' (20% CAPEX)', value: Math.round(capex * 0.20), color: 'var(--secondary)' },
                { label: 'Éco-prêt taux 0% (15 ans)', value: Math.min(100000, Math.round(capex * 0.30)), color: '#7BAEFB' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value.toLocaleString()} €</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${Math.min(100, item.value / capex * 100)}%`, background: item.color }} />
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Total aides cumulées</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
                    {(totalCeeEuros + Math.round(capex * 0.20) + Math.min(100000, Math.round(capex * 0.30))).toLocaleString()} €
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Reste à charge</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {Math.max(0, capex - totalCeeEuros - Math.round(capex * 0.20) - Math.min(100000, Math.round(capex * 0.30))).toLocaleString()} €
                  </span>
                </div>
              </div>
            </div>
            <button className="bp" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => alert('Démarche MaPrimeRénov\' initiée sur anah.fr')}>
              <Calculator size={14} /> Simuler sur anah.fr
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: Synthèse ── */}
      {tab === 3 && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 20 }}>Plan de financement recommandé — {site.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                {
                  title: 'CEE (prioritaire)',
                  amount: totalCeeEuros,
                  desc: 'À engager avant travaux. Choisir un acheteur obligé partenaire.',
                  color: 'var(--primary)',
                  pct: Math.round(totalCeeEuros / totalCapex * 100),
                },
                {
                  title: 'MaPrimeRénov\'',
                  amount: Math.round(capex * 0.20),
                  desc: 'Dossier ANAH à déposer 2 mois avant les travaux.',
                  color: 'var(--secondary)',
                  pct: Math.round(capex * 0.20 / totalCapex * 100),
                },
                {
                  title: 'Éco-prêt 0%',
                  amount: Math.min(100000, Math.round(capex * 0.30)),
                  desc: 'Financer le solde sans intérêts sur 15 ans.',
                  color: '#7BAEFB',
                  pct: Math.round(Math.min(100000, capex * 0.30) / totalCapex * 100),
                },
              ].map(item => (
                <div key={item.title} style={{ padding: '16px', background: 'rgba(255,255,255,.03)', borderRadius: 10, borderTop: `3px solid ${item.color}` }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: item.color, marginBottom: 6 }}>
                    {item.amount.toLocaleString()} €
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>{item.desc}</div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{item.pct}% du CAPEX</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', background: 'rgba(0,226,158,.05)', border: '1px solid rgba(0,226,158,.15)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>CAPEX total estimé</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Après déduction de toutes les aides</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>
                    {totalCapex.toLocaleString()} € brut
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                    {Math.max(0, totalCapex - totalCeeEuros - Math.round(capex * 0.20) - Math.min(100000, Math.round(capex * 0.30))).toLocaleString()} €
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>reste à charge</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="bp" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => window.location.href = '/dashboard/documents'}>
              <FileText size={14} /> Générer le dossier de financement
            </button>
            <button className="bg" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => alert('Export PDF de la simulation envoyé par email')}>
              Exporter la simulation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
