import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

const OPERAT_URL = process.env.OPERAT_API_URL || 'https://operat.ademe.fr/api/v1'

async function operatRequest(path: string, apiKey: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${OPERAT_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OPERAT API ${res.status}: ${text}`)
  }
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { action, apiKey, buildingId, year } = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id, role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Droits administrateur requis' }, { status: 403 })
    }

    const admin = createAdminSupabaseClient()

    // Validate API key
    if (action === 'validate') {
      try {
        await operatRequest('/me', apiKey)
        await admin.from('organizations').update({ operat_api_key: apiKey, operat_connected: true }).eq('id', profile.org_id)
        return NextResponse.json({ success: true, message: 'Clé API OPERAT validée' })
      } catch {
        return NextResponse.json({ error: 'Clé API invalide' }, { status: 400 })
      }
    }

    // Get stored API key
    const { data: org } = await admin.from('organizations').select('operat_api_key').eq('id', profile.org_id).single()
    const key = apiKey || org?.operat_api_key
    if (!key) return NextResponse.json({ error: 'Clé API OPERAT non configurée' }, { status: 400 })

    // Sync all buildings
    if (action === 'sync') {
      const { data: buildings } = await admin.from('buildings')
        .select('id, name, operat_id, surface_m2, ref_year, ref_consumption')
        .eq('org_id', profile.org_id)

      const results: any[] = []

      for (const building of buildings || []) {
        if (!building.operat_id) {
          results.push({ building: building.name, status: 'skipped', reason: 'Pas d\'ID OPERAT configuré' })
          continue
        }

        try {
          const currentYear = new Date().getFullYear() - 1
          const operatData = await operatRequest(`/batiments/${building.operat_id}/consommations/${currentYear}`, key)

          // Upsert declaration
          await admin.from('energy_declarations').upsert({
            building_id: building.id,
            year: currentYear,
            electricity_kwh: operatData.electricity_kwh || 0,
            gas_kwh: operatData.gas_kwh || 0,
            heat_kwh: operatData.heat_kwh || 0,
            water_m3: operatData.water_m3 || 0,
            total_kwh_m2: building.surface_m2 ? (operatData.total_kwh || 0) / building.surface_m2 : null,
            source: 'operat',
          }, { onConflict: 'building_id,year' })

          // Update building reduction
          if (building.ref_consumption && operatData.total_kwh_m2) {
            const reduction = Math.round((1 - operatData.total_kwh_m2 / building.ref_consumption) * 100)
            await admin.from('buildings').update({ current_reduction: reduction }).eq('id', building.id)
          }

          results.push({ building: building.name, status: 'synced', year: currentYear })
        } catch (err: any) {
          results.push({ building: building.name, status: 'error', error: err.message })
        }
      }

      return NextResponse.json({ success: true, results, synced_at: new Date().toISOString() })
    }

    // Declare a specific building/year
    if (action === 'declare' && buildingId && year) {
      const { data: building } = await admin.from('buildings').select('operat_id').eq('id', buildingId).single()
      if (!building?.operat_id) return NextResponse.json({ error: 'Bâtiment sans ID OPERAT' }, { status: 400 })

      const { data: decl } = await admin.from('energy_declarations')
        .select('*').eq('building_id', buildingId).eq('year', year).single()

      if (!decl) return NextResponse.json({ error: 'Déclaration non trouvée' }, { status: 404 })

      await operatRequest(`/batiments/${building.operat_id}/consommations`, key, 'POST', {
        annee: year,
        electricite_kwh: decl.electricity_kwh,
        gaz_kwh: decl.gas_kwh,
        chaleur_kwh: decl.heat_kwh,
        eau_m3: decl.water_m3,
      })

      await admin.from('energy_declarations').update({ source: 'operat' }).eq('id', decl.id)

      return NextResponse.json({ success: true, message: `Déclaration ${year} transmise à OPERAT` })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (err: any) {
    console.error('OPERAT sync error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', session.user.id).single()
    const admin = createAdminSupabaseClient()
    const { data: org } = await admin.from('organizations').select('operat_connected, operat_api_key').eq('id', profile?.org_id).single()

    return NextResponse.json({
      connected: org?.operat_connected || false,
      has_key: !!org?.operat_api_key,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
