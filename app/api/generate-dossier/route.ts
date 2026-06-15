import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { type, site, siteId } = await req.json()

    const PROMPTS: Record<string, string> = {
      conformite: `Tu es un expert en conformité au décret tertiaire français.
Génère un dossier de conformité complet en HTML pour le bâtiment suivant :
- Nom : ${site.name}
- Adresse : ${site.address}
- Surface : ${site.surf}
- Type : ${site.type}
- Zone climatique : ${site.zone}
- Consommation actuelle : ${site.conso} kWh/m²/an
- Consommation référence 2010 : ${site.ref} kWh/m²/an
- Réduction actuelle : ${site.red}%

Le dossier doit inclure :
1. Résumé exécutif (statut conformité, risques)
2. Analyse de la trajectoire OPERAT (objectifs 2030/2040/2050)
3. Diagnostic des consommations (benchmark sectoriel)
4. Plan d'action recommandé (5 actions prioritaires)
5. Synthèse financière (CAPEX, CEE, TRI)

Format : HTML complet avec styles CSS inline, couleurs #00E29E et #060A17, police Sora.`,

      bacs: `Tu es un expert en décret BACS (n°2020-887).
Génère un rapport d'audit BACS complet en HTML pour :
- Bâtiment : ${site.name}
- Type : ${site.type}
- Surface : ${site.surf}

Le rapport doit inclure :
1. Résumé de conformité BACS
2. Diagnostic par système (chauffage, clim, ECS, ventilation, éclairage)
3. Classification A/B/C/D avec justification
4. Feuille de route de mise en conformité
5. ROI et financement (CEE, MaPrimeRénov')

Format : HTML complet avec styles CSS inline.`,

      operat: `Génère un fichier CSV formaté pour import sur operat.ademe.fr pour :
- Bâtiment : ${site.name}
- Adresse : ${site.address}
- Consommation 2024 : ${site.conso} kWh/m²/an
- Surface : ${site.surf.replace(/[^0-9]/g, '')} m²

Format exact OPERAT v3 avec colonnes : identifiant_bat;annee;electricite_kWh;gaz_kWh;chaleur_kWh;eau_m3;total_kWh_m2`,
    }

    const prompt = PROMPTS[type]
    if (!prompt) return NextResponse.json({ error: 'Type invalide' }, { status: 400 })

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = (message.content[0] as any).text

    // Save to DB
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', session.user.id).single()
    await supabase.from('dossiers').insert({
      org_id: profile?.org_id,
      user_id: session.user.id,
      building_name: site.name,
      type,
      content: { html: content },
    })

    const contentType = type === 'operat' ? 'text/csv; charset=utf-8' : 'text/html; charset=utf-8'
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="horizonenergie_${type}_${site.name}.${type === 'operat' ? 'csv' : 'html'}"`,
      },
    })
  } catch (err: any) {
    console.error('Generate dossier error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
