import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

const ENEDIS_TOKEN_URL = 'https://datahub-enedis.fr/dataconnect/v1/oauth2/token'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('ENEDIS OAuth error:', error, searchParams.get('error_description'))
      return NextResponse.redirect(new URL(`/dashboard/parametres?error=enedis_denied`, req.url))
    }

    // Verify CSRF state
    const storedState = req.cookies.get('enedis_oauth_state')?.value
    if (!state || state !== storedState) {
      return NextResponse.redirect(new URL('/dashboard/parametres?error=enedis_state', req.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/parametres?error=enedis_no_code', req.url))
    }

    // Exchange code for tokens
    const tokenRes = await fetch(ENEDIS_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ENEDIS_CLIENT_ID!,
        client_secret: process.env.ENEDIS_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.ENEDIS_REDIRECT_URI!,
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('ENEDIS token exchange failed:', errText)
      return NextResponse.redirect(new URL('/dashboard/parametres?error=enedis_token', req.url))
    }

    const tokens = await tokenRes.json()
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    // Store tokens in org
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.redirect(new URL('/login', req.url))

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', session.user.id).single()
    const admin = createAdminSupabaseClient()

    await admin.from('organizations').update({
      enedis_connected: true,
      enedis_access_token: tokens.access_token,
      enedis_refresh_token: tokens.refresh_token,
      enedis_token_expiry: expiresAt,
    }).eq('id', profile?.org_id)

    // Clear CSRF cookie
    const response = NextResponse.redirect(new URL('/dashboard/parametres?tab=4&enedis=connected', req.url))
    response.cookies.delete('enedis_oauth_state')
    return response
  } catch (err: any) {
    console.error('ENEDIS callback error:', err)
    return NextResponse.redirect(new URL('/dashboard/parametres?error=enedis_callback', req.url))
  }
}
