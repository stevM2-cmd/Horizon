import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { randomBytes } from 'crypto'

const ENEDIS_AUTH_URL = 'https://datahub-enedis.fr/dataconnect/v1/oauth2/authorize'

export async function GET(req: NextRequest) {
  try {
    // Graceful fallback when ENEDIS credentials are not configured
    if (!process.env.ENEDIS_CLIENT_ID || !process.env.ENEDIS_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL('/dashboard/parametres?tab=4&enedis=demo', req.url)
      )
    }

    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.redirect(new URL('/login', req.url))

    const state = randomBytes(16).toString('hex')

    const response = NextResponse.redirect(
      `${ENEDIS_AUTH_URL}?` + new URLSearchParams({
        client_id: process.env.ENEDIS_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: process.env.ENEDIS_REDIRECT_URI!,
        state,
        duration: 'P1Y',
      })
    )

    response.cookies.set('enedis_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    })

    return response
  } catch (err: any) {
    console.error('ENEDIS auth error:', err)
    return NextResponse.redirect(new URL('/dashboard/parametres?error=enedis_auth', req.url))
  }
}
