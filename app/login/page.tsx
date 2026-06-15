'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        router.push('/onboarding')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>HorizonEnergie</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            {mode === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte'}
          </div>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@entreprise.fr" required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</div>}
          <button className="bp" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          {mode === 'login' ? (
            <>Pas encore de compte ?{' '}
              <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                S'inscrire
              </button>
            </>
          ) : (
            <>Déjà un compte ?{' '}
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
