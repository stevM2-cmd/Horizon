import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const siteId = formData.get('siteId') as string

    if (!file) return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', session.user.id).single()

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = file.type as 'application/pdf' | 'image/jpeg' | 'image/png'

    let extractedData: any

    if (mimeType === 'application/pdf') {
      const message = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: `Extrais les données énergétiques de cette facture. Réponds en JSON avec ces champs :
{
  "fournisseur": "string",
  "periode_debut": "YYYY-MM-DD",
  "periode_fin": "YYYY-MM-DD",
  "electricite_kwh": number | null,
  "gaz_kwh": number | null,
  "montant_ttc": number | null,
  "puissance_souscrite_kva": number | null,
  "prm": "string | null"
}
Ne réponds qu'avec le JSON, rien d'autre.`,
            },
          ],
        }],
      })
      extractedData = JSON.parse((message.content[0] as any).text)
    } else {
      return NextResponse.json({ error: 'Format non supporté. Utilisez PDF.' }, { status: 400 })
    }

    // Store file in Supabase Storage
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `orgs/${profile?.org_id}/buildings/${siteId}/invoices/${new Date().getFullYear()}/${fileName}`

    await supabase.storage.from('invoices').upload(filePath, arrayBuffer, {
      contentType: mimeType,
      upsert: false,
    })

    // Upsert energy declaration if data found
    if (extractedData.periode_debut && (extractedData.electricite_kwh || extractedData.gaz_kwh)) {
      const year = new Date(extractedData.periode_debut).getFullYear()
      const { data: building } = await supabase
        .from('buildings')
        .select('id, surface_m2')
        .eq('org_id', profile?.org_id)
        .limit(1)
        .single()

      if (building) {
        const total = (extractedData.electricite_kwh || 0) + (extractedData.gaz_kwh || 0)
        await supabase.from('energy_declarations').upsert({
          building_id: building.id,
          year,
          electricity_kwh: extractedData.electricite_kwh || 0,
          gas_kwh: extractedData.gaz_kwh || 0,
          total_kwh_m2: building.surface_m2 ? total / building.surface_m2 : null,
          source: 'invoice',
        }, { onConflict: 'building_id,year' })
      }
    }

    return NextResponse.json({ success: true, data: extractedData, file_path: filePath })
  } catch (err: any) {
    console.error('Upload invoice error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
