import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { buildingId, bacsData } = await req.json()

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', session.user.id).single()
    const { data: building } = await supabase.from('buildings').select('*').eq('id', buildingId).single()

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Tu es un expert en décret BACS n°2020-887 et en systèmes GTB.

Analyse ces données BACS et génère un audit complet en JSON :

Bâtiment : ${building?.name}
Surface : ${building?.surface_m2} m²
Systèmes : ${JSON.stringify(bacsData, null, 2)}

Génère un JSON avec :
{
  "classe_actuelle": "A|B|C|D",
  "classe_objectif": "A|B|C|D",
  "statut": "conforme|non_conforme|en_cours",
  "diagnostic": {
    "points_forts": ["..."],
    "points_faibles": ["..."],
    "risques": ["..."]
  },
  "feuille_de_route": [
    { "priorite": 1, "action": "...", "delai_mois": 3, "cout_estime": 5000, "impact": "..." }
  ],
  "roi": {
    "economie_annuelle_pct": 15,
    "capex_total": 42000,
    "tri_annees": 4,
    "cee_kwh_cumac": 680000
  },
  "justification_classe": "..."
}

Réponds uniquement avec le JSON valide.`,
      }],
    })

    const auditData = JSON.parse((message.content[0] as any).text)

    // Save audit to DB
    await supabase.from('bacs_audits').upsert({
      building_id: buildingId,
      classe_actuelle: auditData.classe_actuelle,
      classe_objectif: auditData.classe_objectif,
      statut: auditData.statut,
      gtb_installed: bacsData.gtb_installed || false,
      audit_content: auditData,
      audited_at: new Date().toISOString(),
    }, { onConflict: 'building_id' })

    return NextResponse.json(auditData)
  } catch (err: any) {
    console.error('BACS audit error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
