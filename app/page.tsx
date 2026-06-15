'use client'
import { useRouter } from 'next/navigation'
import { Shield, TrendingUp, Zap, FileText, Users, ChevronRight, Check, Building2, BarChart3, Lock } from 'lucide-react'

const FEATURES = [
  { icon: BarChart3, title: 'Trajectoire OPERAT', desc: 'Pilotez vos -40% 2030 avec des tableaux de bord en temps réel. Déclaration automatique sur operat.ademe.fr.' },
  { icon: Shield, title: 'Décret BACS', desc: 'Diagnostic classe A/B/C/D, feuille de route et ROI. Mises en conformité 2025 et 2027 suivies.' },
  { icon: TrendingUp, title: 'Simulation financement', desc: 'CEE, CPE, tiers-investisseur, MaPrimeRénov\'. Calculez vos aides en quelques clics.' },
  { icon: Zap, title: 'Connexion ENEDIS', desc: 'Data Connect OAuth 2.0 : courbes de charge par PRM, consentements locataires automatisés.' },
  { icon: FileText, title: 'Documents IA', desc: 'Dossiers de conformité, audits BACS et exports OPERAT générés par Claude en quelques secondes.' },
  { icon: Users, title: 'Gestion locataires', desc: 'Segmentation PRM par étage, funnel de consentement ENEDIS, emails de relance personnalisés.' },
]

const PLANS = [
  {
    name: 'Starter', price: 99,
    features: ['3 bâtiments', 'Déclaration OPERAT manuelle', 'Dashboard BACS', 'Export CSV', 'Support email'],
    cta: 'Démarrer',
  },
  {
    name: 'Pro', price: 299, highlight: true,
    features: ['15 bâtiments', 'API OPERAT réelle', 'ENEDIS Data Connect', 'Import factures IA', 'Simulation financement', 'Support prioritaire'],
    cta: 'Essai gratuit 14 jours',
  },
  {
    name: 'Business', price: 799,
    features: ['Bâtiments illimités', 'Toutes les intégrations', 'Multi-équipes', 'SLA 99,9%', 'Account manager dédié'],
    cta: 'Nous contacter',
  },
]

const STATS = [
  { value: '−40%', label: 'Objectif consommation 2030' },
  { value: '30 sept. 2026', label: 'Prochaine deadline OPERAT' },
  { value: '6ème période', label: 'CEE en cours' },
  { value: '2025 / 2027', label: 'Échéances BACS' },
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,10,23,.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>HorizonEnergie</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="bg" onClick={() => router.push('/login')} style={{ padding: '8px 18px', fontSize: 13 }}>
            Se connecter
          </button>
          <button className="bp" onClick={() => router.push('/login')} style={{ padding: '8px 18px', fontSize: 13 }}>
            Essai gratuit →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '100px 40px 80px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,226,158,.1)', border: '1px solid rgba(0,226,158,.2)',
          borderRadius: 20, padding: '6px 16px', fontSize: 12, color: 'var(--primary)',
          marginBottom: 28, fontWeight: 600,
        }}>
          <Zap size={12} /> Décret tertiaire · BACS · ENEDIS · CEE
        </div>

        <h1 className="serif" style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.15, marginBottom: 24 }}>
          Pilotez votre conformité<br />
          <span style={{ color: 'var(--primary)' }}>énergétique tertiaire</span>
        </h1>

        <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40, maxWidth: 620, margin: '0 auto 40px' }}>
          La plateforme SaaS tout-en-un pour les propriétaires fonciers français.
          OPERAT, BACS, ENEDIS et financement CEE — centralisés, automatisés, conformes.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="bp" onClick={() => router.push('/login')}
            style={{ padding: '14px 32px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            Démarrer gratuitement <ChevronRight size={16} />
          </button>
          <button className="bg" onClick={() => router.push('/dashboard')}
            style={{ padding: '14px 32px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            Voir la démo →
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
          14 jours d'essai gratuit · Sans carte bancaire · Installation en 5 minutes
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '32px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '8px 0',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Tout ce qu'il faut pour être conforme</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>6 modules intégrés pour couvrir l'intégralité des obligations réglementaires.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ transition: 'border-color .2s' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(0,226,158,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <f.icon size={20} color="var(--primary)" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={{ padding: '0 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden',
          background: 'var(--card)', boxShadow: '0 40px 100px rgba(0,0,0,.4)',
        }}>
          {/* Fake browser bar */}
          <div style={{
            padding: '10px 16px', background: 'rgba(255,255,255,.03)',
            borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {['#F87171','#FBBF24','#00E29E'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <div style={{ flex: 1, background: 'rgba(255,255,255,.05)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>
              app.horizonenergie.io/dashboard
            </div>
          </div>
          {/* Preview content */}
          <div style={{ padding: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Réduction actuelle', value: '−18%', sub: 'Objectif 2030 : −40%', color: 'var(--primary)' },
                { label: 'Consommation', value: '694 kWh/m²', sub: 'Référence 847', color: 'var(--text)' },
                { label: 'CEE mobilisables', value: '3 GWh', sub: 'Cumac 6ème période', color: 'var(--text)' },
                { label: 'Classe BACS', value: 'Classe C', sub: '⚠ Non conforme', color: 'var(--danger)' },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>{kpi.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{kpi.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 16, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Trajectoire OPERAT</div>
                <svg width="100%" height="60" viewBox="0 0 300 60">
                  <polyline points="0,50 60,45 120,38 180,30 240,20 300,8" fill="none" stroke="rgba(0,226,158,.3)" strokeWidth="2" strokeDasharray="4,2" />
                  <polyline points="0,50 60,48 120,46" fill="none" stroke="var(--secondary)" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 16, height: 120 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Actions prioritaires</div>
                {['Pilotage GTB — Urgent', 'LED + présence — Urgent', 'PAC chauffage — Medium'].map((a, i) => (
                  <div key={i} style={{ fontSize: 11, color: 'var(--muted)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>{a}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Tarifs transparents</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>Adapté à votre parc immobilier. Sans engagement, résiliable à tout moment.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {PLANS.map(p => (
            <div key={p.name} className="card" style={{
              position: 'relative',
              border: p.highlight ? '1px solid rgba(0,226,158,.35)' : '1px solid var(--border)',
              background: p.highlight ? 'rgba(0,226,158,.04)' : 'var(--card)',
            }}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--primary)', color: '#060A17',
                  fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20,
                }}>Recommandé</div>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: p.highlight ? 'var(--primary)' : 'var(--text)' }}>{p.price} €</span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>/mois</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13 }}>
                    <Check size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </div>
                ))}
              </div>
              <button
                className={p.highlight ? 'bp' : 'bg'}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => router.push('/login')}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        margin: '0 40px 80px', borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(0,226,158,.12) 0%, rgba(0,191,212,.08) 100%)',
        border: '1px solid rgba(0,226,158,.2)',
        padding: '60px 40px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Prêt à piloter votre conformité ?</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 16 }}>
          Rejoignez les propriétaires qui anticipent les obligations réglementaires plutôt que de les subir.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="bp" onClick={() => router.push('/login')}
            style={{ padding: '14px 36px', fontSize: 15 }}>
            Démarrer maintenant — gratuit
          </button>
          <button className="bg" onClick={() => router.push('/dashboard')}
            style={{ padding: '14px 36px', fontSize: 15 }}>
            Voir la démo
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>HorizonEnergie</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          © 2026 HorizonEnergie · Conformité décret tertiaire & BACS
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Mentions légales', 'CGU', 'RGPD'].map(l => (
            <span key={l} style={{ fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
