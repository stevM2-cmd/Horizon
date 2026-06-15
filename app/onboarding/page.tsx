'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Check, Building2, Users, Zap, FileText, ChevronRight } from 'lucide-react'

const STEPS = [
  { label: 'Organisation', icon: Building2 },
  { label: 'Premier bâtiment', icon: Building2 },
  { label: 'Consommations', icon: Zap },
  { label: 'Locataires', icon: Users },
  { label: 'Documents', icon: FileText },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Org
  const [orgName, setOrgName] = useState('')
  const [siret, setSiret] = useState('')

  // Building
  const [buildingName, setBuildingName] = useState('')
  const [buildingAddress, setBuildingAddress] = useState('')
  const [surface, setSurface] = useState('')
  const [activityType, setActivityType] = useState('Bureaux')

  // Consumption
  const [electricity, setElectricity] = useState('')
  const [gas, setGas] = useState('')
  const [refYear, setRefYear] = useState('2010')
  const [refConso, setRefConso] = useState('')

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else finish()
  }

  const finish = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')

      const { data: org } = await supabase.from('organizations').insert({
        name: orgName || 'Mon organisation',
        siret: siret || null,
        plan: 'starter',
      }).select().single()

      await supabase.from('profiles').upsert({
        id: user.id,
        org_id: org.id,
        full_name: '',
        role: 'admin',
      })

      if (buildingName) {
        await supabase.from('buildings').insert({
          org_id: org.id,
          name: buildingName,
          address: buildingAddress,
          surface_m2: parseFloat(surface) || null,
          activity_type: activityType,
          ref_year: parseInt(refYear),
          ref_consumption: parseFloat(refConso) || null,
        })
      }

      router.push('/dashboard')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i < step ? 'var(--primary)' : i === step ? 'rgba(0,226,158,.15)' : 'rgba(255,255,255,.05)',
                border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i < step ? '#060A17' : i === step ? 'var(--primary)' : 'var(--muted)',
                fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}>
                {i < step ? <Check size={15} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--border)', margin: '0 4px' }} />
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{STEPS[step].label}</div>
            <span className="tag tag-gray">{step + 1}/{STEPS.length}</span>
          </div>

          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Raison sociale *</label>
                <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Groupe Berlier SAS" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>SIRET</label>
                <input value={siret} onChange={e => setSiret(e.target.value)} placeholder="41234567890123" maxLength={14} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Nom du bâtiment *</label>
                <input value={buildingName} onChange={e => setBuildingName(e.target.value)} placeholder="Tour Bergame" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Adresse</label>
                <input value={buildingAddress} onChange={e => setBuildingAddress(e.target.value)} placeholder="15 rue Lecourbe, 75015 Paris" />
              </div>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Surface (m²)</label>
                  <input type="number" value={surface} onChange={e => setSurface(e.target.value)} placeholder="3200" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Type d'activité</label>
                  <select value={activityType} onChange={e => setActivityType(e.target.value)}>
                    <option>Bureaux</option>
                    <option>Commerce</option>
                    <option>Logistique</option>
                    <option>Industrie</option>
                    <option>Santé</option>
                    <option>Enseignement</option>
                    <option>Hôtellerie</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '10px 14px', background: 'rgba(0,226,158,.05)', border: '1px solid rgba(0,226,158,.15)', borderRadius: 8, fontSize: 12, color: 'var(--muted)' }}>
                Saisissez les consommations de l'année de référence (2010 ou la première année d'occupation) pour calculer vos objectifs décret tertiaire.
              </div>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Année de référence</label>
                  <select value={refYear} onChange={e => setRefYear(e.target.value)}>
                    {Array.from({ length: 16 }, (_, i) => 2010 + i).map(y => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Conso. référence (kWh/m²)</label>
                  <input type="number" value={refConso} onChange={e => setRefConso(e.target.value)} placeholder="847" />
                </div>
              </div>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Électricité 2024 (kWh)</label>
                  <input type="number" value={electricity} onChange={e => setElectricity(e.target.value)} placeholder="1500000" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Gaz 2024 (kWh)</label>
                  <input type="number" value={gas} onChange={e => setGas(e.target.value)} placeholder="500000" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                Vous pourrez ajouter vos locataires et gérer les consentements ENEDIS depuis le module Locataires.
              </div>
              <div style={{ padding: '16px', background: 'rgba(0,191,212,.05)', border: '1px solid rgba(0,191,212,.15)', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Connexion ENEDIS Data Connect</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                  Récupérez automatiquement les données de consommation de vos locataires avec leur accord.
                </div>
                <button className="bg" onClick={() => window.location.href = '/api/enedis/auth'} style={{ fontSize: 12, padding: '7px 14px' }}>
                  Connecter ENEDIS maintenant →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                Votre espace est prêt. Vous pourrez générer vos premiers documents depuis le module Documents IA.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Dossier de conformité décret tertiaire', 'Rapport d\'audit BACS', 'Export OPERAT'].map(d => (
                  <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
                    <Check size={14} color="var(--primary)" />
                    <span style={{ fontSize: 13 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            {step > 0 ? (
              <button className="bg" onClick={() => setStep(s => s - 1)}>Retour</button>
            ) : <div />}
            <button className="bp" onClick={next} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading ? 'Création...' : step === STEPS.length - 1 ? 'Accéder au dashboard' : 'Continuer'}
              {!loading && <ChevronRight size={15} />}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={finish} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
            Passer l'onboarding →
          </button>
        </div>
      </div>
    </div>
  )
}
