import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

const ENEDIS_API = process.env.ENEDIS_API_URL || 'https://datahub-enedis.fr/api/v1'

async function refreshToken(orgId: string, refreshToken: string) {
  const res = await fetch('https://datahub-enedis.fr/dataconnect/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ENEDIS_CLIENT_ID!,
      client_secret: process.env.ENEDIS_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error('Token refresh failed')
  const tokens = await res.json()
  const admin = createAdminSupabaseClient()
  await admin.from('organizations').update({
    enedis_access_token: tokens.access_token,
    enedis_refresh_token: tokens.refresh_token,
    enedis_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  }).eq('id', orgId)
  return tokens.access_token as string
}

async function enedisRequest(path: string, token: string) {
  const res = await fetch(`${ENEDIS_API}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ENEDIS API ${res.status}: ${text}`)
  }
  return res.json()
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const prm = searchParams.get('prm')
    const type = searchParams.get('type') || 'consumption'
    const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
    const end = searchParams.get('end') || new Date().toISOString().split('T')[0]

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', session.user.id).single()
    const admin = createAdminSupabaseClient()
    const { data: org } = await admin.from('organizations')
      .select('enedis_access_token, enedis_refresh_token, enedis_token_expiry, enedis_connected')
      .eq('id', profile?.org_id)
      .single()

    if (!org?.enedis_connected || !org?.enedis_access_token) {
      return NextResponse.json({ error: 'ENEDIS non connecté' }, { status: 400 })
    }

    // Refresh token if expired
    let token = org.enedis_access_token
    if (org.enedis_token_expiry && new Date(org.enedis_token_expiry) < new Date()) {
      token = await refreshToken(profile?.org_id, org.enedis_refresh_token)
    }

    // Fetch data based on type
    let data: any

    if (type === 'consumption' && prm) {
      // Courbe de charge (CDC) — données 30 min
      data = await enedisRequest(
        `/metering_data/consumption_load_curve?usage_point_id=${prm}&start=${start}&end=${end}`,
        token
      )
    } else if (type === 'contracts' && prm) {
      // Contrat et puissance souscrite
      data = await enedisRequest(`/customers/usage_points/contracts?usage_point_id=${prm}`, token)
    } else if (type === 'addresses' && prm) {
      // Adresse du PDL
      data = await enedisRequest(`/customers/usage_points/addresses?usage_point_id=${prm}`, token)
    } else if (type === 'meter_reading' && prm) {
      // Index de consommation
      data = await enedisRequest(
        `/metering_data/daily_consumption?usage_point_id=${prm}&start=${start}&end=${end}`,
        token
      )
    } else {
      // Stats globales pour tous les PRM de l'org
      const { data: tenants } = await admin.from('tenants')
        .select('prm, company_name, consent_status')
        .eq('org_id', profile?.org_id)
        .eq('consent_status', 'granted')
        .not('prm', 'is', null)

      const results: any[] = []
      for (const tenant of tenants || []) {
        try {
          const consump = await enedisRequest(
            `/metering_data/daily_consumption?usage_point_id=${tenant.prm}&start=${start}&end=${end}`,
            token
          )
          results.push({ prm: tenant.prm, company: tenant.company_name, data: consump })
        } catch (e: any) {
          results.push({ prm: tenant.prm, company: tenant.company_name, error: e.message })
        }
      }
      return NextResponse.json({ results, fetched_at: new Date().toISOString() })
    }

    return NextResponse.json({ data, fetched_at: new Date().toISOString() })
  } catch (err: any) {
    console.error('ENEDIS data error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
