'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Settings, User, Building2, Users, CreditCard, Key, Link, Bell, Shield, Check, ExternalLink } from 'lucide-react'
import { STRIPE_PLANS } from '@/lib/constants'

const TABS = ['Profil', 'Organisation', 'Membres', 'Abonnement', 'Intégrations', 'Sécurité']

function ParametresContent() {
  const searchParams = useSearchParams()
  const tabParam = parseInt(searchParams.get('tab') || '0')
  const enedisStatus = searchParams.get('enedis')
  const [tab, setTab] = useState(tabParam)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  // Org form
  const [orgName, setOrgName] = useState('Groupe Berlier SAS')
  const [siret, setSiret] = useState('41234567890123')
  const [plan, setPlan] = useState('pro')

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifDeadlines, setNotifDeadlines] = useState(true)
  const [notifReports, setNotifReports] = useState(false)

  // Integrations
  const [operatConnected, setOperatConnected] = useState(false)
  const [enedisConnected, setEnedisConnected] = useState(false)
  const [operatKey, setOperatKey] = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setEmail(data.user?.email || '')
    })
  }, [])

  const save = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const connectEnedis = () => {
    window.location.href = '/api/enedis/auth'
  }

  const connectOperat = async () => {
    if (!operatKey) { alert('Entrez votre clé API OPERAT'); return }
    setLoading(true)
    const res = await fetch('/api/operat-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', apiKey: operatKey }),
    })
    setLoading(false)
    if (res.ok) { setOperatConnected(true); alert('Connexion OPERAT validée') }
    else { alert('Clé API OPERAT invalide') }
  }

  const openStripePortal = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (data.url) window.location.href = data.url
  }

  const startCheckout = async (priceId: string) => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.url) window.location.href = data.url
  }

  const currentPlanData = STRIPE_PLANS.find(p => p.id === plan)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={20} color="var(--primary)" /> Paramètres
        </h1>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
          Gérez votre compte, votre organisation et vos intégrations
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Sidebar tabs */}
        <nav>
          {TABS.map((t, i) => {
            const Icon = [User, Building2, Users, CreditCard, Link, Shield][i]
            return (
              <button key={i} onClick={() => setTab(i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: tab === i ? 'rgba(0,226,158,.1)' : 'transparent',
                  color: tab === i ? 'var(--primary)' : 'var(--muted)',
                  fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: tab === i ? 600 : 400,
                  marginBottom: 2, textAlign: 'left', transition: 'all .15s',
                }}>
                <Icon size={15} />
                {t}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div>
          {/* ── Profil ── */}
          {tab === 0 && (
            <div className="card">
              <h3 style={{ fontSize: 15, marginBottom: 20 }}>Informations personnelles</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Nom complet</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Dupont" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Rôle</label>
                  <select style={{ maxWidth: 200 }}>
                    <option>Administrateur</option>
                    <option>Membre</option>
                    <option>Lecteur</option>
                  </select>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
                  <h4 style={{ fontSize: 13, marginBottom: 12 }}>Notifications</h4>
                  {[
                    { label: 'Rappels échéances réglementaires', state: notifDeadlines, set: setNotifDeadlines },
                    { label: 'Résumés hebdomadaires par email', state: notifEmail, set: setNotifEmail },
                    { label: 'Rapports mensuels', state: notifReports, set: setNotifReports },
                  ].map(item => (
                    <label key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
                      <div onClick={() => item.set(!item.state)}
                        style={{
                          width: 40, height: 22, borderRadius: 11,
                          background: item.state ? 'var(--primary)' : 'rgba(255,255,255,.1)',
                          position: 'relative', transition: 'background .2s', cursor: 'pointer',
                        }}>
                        <div style={{
                          position: 'absolute', top: 3, left: item.state ? 21 : 3,
                          width: 16, height: 16, borderRadius: '50%',
                          background: 'white', transition: 'left .2s',
                        }} />
                      </div>
                      <span style={{ fontSize: 13 }}>{item.label}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="bp" onClick={save} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {saved ? <><Check size={14} /> Enregistré</> : loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Organisation ── */}
          {tab === 1 && (
            <div className="card">
              <h3 style={{ fontSize: 15, marginBottom: 20 }}>Informations de l'organisation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Raison sociale</label>
                  <input value={orgName} onChange={e => setOrgName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>SIRET</label>
                  <input value={siret} onChange={e => setSiret(e.target.value)} placeholder="41234567890123" maxLength={14} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Secteur d'activité</label>
                  <select>
                    <option>Immobilier & foncier</option>
                    <option>Promotion immobilière</option>
                    <option>Gestion d'actifs</option>
                    <option>Industrie</option>
                    <option>Commerce</option>
                    <option>Santé</option>
                    <option>Enseignement</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Nombre de bâtiments dans le parc</label>
                  <input type="number" defaultValue={3} style={{ maxWidth: 120 }} />
                </div>
                <button className="bp" onClick={save} disabled={loading} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saved ? <><Check size={14} /> Enregistré</> : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {/* ── Membres ── */}
          {tab === 2 && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15 }}>Membres de l'équipe</h3>
                  <button className="bp" style={{ padding: '7px 14px', fontSize: 12 }}
                    onClick={() => alert('Invitation envoyée par email')}>
                    + Inviter un membre
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { name: 'Jean-Pierre Berlier', email: 'jp.berlier@groupe-berlier.fr', role: 'Administrateur', status: 'active' },
                    { name: 'Marie Fontaine', email: 'marie.fontaine@groupe-berlier.fr', role: 'Membre', status: 'active' },
                    { name: 'Thomas Renard', email: 'thomas.renard@groupe-berlier.fr', role: 'Lecteur', status: 'pending' },
                  ].map(m => (
                    <div key={m.email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(0,226,158,.15)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, flexShrink: 0,
                      }}>
                        {m.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.email}</div>
                      </div>
                      <span className={`tag ${m.status === 'pending' ? 'tag-yellow' : 'tag-gray'}`}>
                        {m.status === 'pending' ? 'En attente' : m.role}
                      </span>
                      <button className="bg" style={{ padding: '5px 10px', fontSize: 11 }}>
                        Modifier
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontSize: 14, marginBottom: 12 }}>Inviter par email</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input placeholder="email@entreprise.fr" type="email" />
                  <select style={{ width: 'auto', padding: '10px 14px' }}>
                    <option>Membre</option>
                    <option>Lecteur</option>
                    <option>Administrateur</option>
                  </select>
                  <button className="bp" style={{ whiteSpace: 'nowrap' }}>Inviter</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Abonnement ── */}
          {tab === 3 && (
            <div>
              <div className="card" style={{ marginBottom: 20, borderLeft: '3px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Plan actuel</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                      {currentPlanData?.name} — {currentPlanData?.price} €/mois
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      Prochain renouvellement : 19 juin 2026
                    </div>
                  </div>
                  <button className="bg" onClick={openStripePortal} disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ExternalLink size={14} />
                    Gérer la facturation
                  </button>
                </div>
              </div>

              <div className="grid-3">
                {STRIPE_PLANS.map(p => {
                  const isCurrent = p.id === plan
                  return (
                    <div key={p.id} className="card" style={{
                      borderColor: isCurrent ? 'rgba(0,226,158,.3)' : 'var(--border)',
                      position: 'relative',
                    }}>
                      {isCurrent && (
                        <div style={{
                          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                          background: 'var(--primary)', color: '#060A17',
                          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        }}>Plan actuel</div>
                      )}
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: isCurrent ? 'var(--primary)' : 'var(--text)', marginBottom: 16 }}>
                        {p.price} €<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/mois</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                        {p.features.map(f => (
                          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
                            <Check size={13} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                            {f}
                          </div>
                        ))}
                      </div>
                      <button
                        className={isCurrent ? 'bg' : 'bp'}
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={isCurrent}
                        onClick={() => startCheckout(p.priceId)}
                      >
                        {isCurrent ? 'Plan actuel' : 'Changer de plan'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Intégrations ── */}
          {tab === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* OPERAT */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,226,158,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 18 }}>🏛️</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>OPERAT — ADEME</div>
                      <span className={`tag ${operatConnected ? 'tag-green' : 'tag-gray'}`}>
                        {operatConnected ? '✓ Connecté' : 'Non connecté'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
                      Synchronisation automatique des déclarations de consommation sur operat.ademe.fr
                    </div>
                    {!operatConnected && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          value={operatKey}
                          onChange={e => setOperatKey(e.target.value)}
                          placeholder="Clé API OPERAT (Espace Pro ADEME)"
                          type="password"
                          style={{ maxWidth: 320 }}
                        />
                        <button className="bp" onClick={connectOperat} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                          Connecter
                        </button>
                      </div>
                    )}
                    {operatConnected && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="bp" onClick={() => fetch('/api/operat-sync', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'sync' }) }).then(() => alert('Synchronisation OPERAT lancée'))}>
                          Synchroniser maintenant
                        </button>
                        <button className="bg" onClick={() => setOperatConnected(false)}>Déconnecter</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ENEDIS */}
              {enedisStatus === 'demo' && (
                <div style={{ padding: '12px 16px', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 8, fontSize: 13, color: 'var(--warn)', marginBottom: 8 }}>
                  ⚠ Mode démo — Configurez <code style={{ fontSize: 12 }}>ENEDIS_CLIENT_ID</code> et <code style={{ fontSize: 12 }}>ENEDIS_CLIENT_SECRET</code> dans <code style={{ fontSize: 12 }}>.env.local</code> pour activer la connexion réelle.
                </div>
              )}
              {enedisStatus === 'connected' && (
                <div style={{ padding: '12px 16px', background: 'rgba(0,226,158,.08)', border: '1px solid rgba(0,226,158,.2)', borderRadius: 8, fontSize: 13, color: 'var(--primary)', marginBottom: 8 }}>
                  ✓ ENEDIS connecté avec succès
                </div>
              )}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,191,212,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 18 }}>⚡</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>ENEDIS Data Connect</div>
                      <span className={`tag ${enedisConnected ? 'tag-green' : 'tag-gray'}`}>
                        {enedisConnected ? '✓ Connecté' : 'Non connecté'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
                      OAuth 2.0 via datahub-enedis.fr — Courbes de charge, données PRM, consentements locataires
                    </div>
                    {!enedisConnected ? (
                      <button className="bp" onClick={connectEnedis}>
                        <Link size={14} /> Connecter via ENEDIS OAuth
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="bp" onClick={() => fetch('/api/enedis/data').then(() => alert('Données ENEDIS actualisées'))}>
                          Actualiser les données
                        </button>
                        <button className="bg" onClick={() => setEnedisConnected(false)}>Déconnecter</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stripe */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99,91,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 18 }}>💳</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>Stripe — Facturation</div>
                      <span className="tag tag-green">✓ Actif</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                      Gérez vos paiements, factures et informations de carte bancaire
                    </div>
                    <button className="bg" onClick={openStripePortal} disabled={loading}>
                      <ExternalLink size={14} /> Portail de facturation Stripe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Sécurité ── */}
          {tab === 5 && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, marginBottom: 20 }}>Changer le mot de passe</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Mot de passe actuel</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Nouveau mot de passe</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Confirmer le nouveau mot de passe</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <button className="bp" onClick={() => alert('Mot de passe modifié')} style={{ alignSelf: 'flex-start' }}>
                    Modifier le mot de passe
                  </button>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, marginBottom: 16 }}>Double authentification (2FA)</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>Authenticator TOTP</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Google Authenticator, Authy, 1Password...</div>
                  </div>
                  <button className="bp" onClick={() => alert('Configuration 2FA en cours...')}>
                    <Shield size={14} /> Activer
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 16, color: 'var(--danger)' }}>Zone dangereuse</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'rgba(248,113,113,.05)', border: '1px solid rgba(248,113,113,.15)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Supprimer le compte</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Suppression définitive de toutes les données</div>
                  </div>
                  <button style={{ padding: '8px 16px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer', fontSize: 13, fontFamily: 'Sora, sans-serif' }}
                    onClick={() => { if (confirm('Êtes-vous sûr ? Cette action est irréversible.')) alert('Contactez support@horizonenergie.io pour supprimer votre compte.') }}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ParametresPage() {
  return <Suspense fallback={<div />}><ParametresContent /></Suspense>
}
