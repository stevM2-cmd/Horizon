import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { tenantId, email, company, building, prm } = await req.json()

    // Generate personalized email with Claude
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Rédige un email professionnel et courtois en français pour demander le consentement ENEDIS Data Connect à un locataire :
- Société locataire : ${company}
- Bâtiment : ${building}
- PRM : ${prm}

L'email doit :
- Expliquer brièvement le décret tertiaire et nos obligations légales
- Préciser que c'est pour améliorer le bâtiment et réduire les charges
- Être concis (max 150 mots)
- Inclure un bouton d'action [DONNER MON CONSENTEMENT]

Réponds avec le corps de l'email en HTML simple (balises p, strong, a uniquement).`,
      }],
    })

    const emailBody = (message.content[0] as any).text

    // Send email via Resend (or log in dev)
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'noreply@horizonenergie.io',
          to: email,
          subject: `Consentement ENEDIS — ${building}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #00E29E;">HorizonEnergie — Demande de consentement</h2>
              ${emailBody}
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #888;">Conformément au RGPD, vos données sont traitées dans le cadre strict du décret tertiaire.</p>
            </div>`,
        }),
      })
    } else {
      console.log(`[DEV] Email consent to ${email}:\n${emailBody}`)
    }

    // Update tenant consent status
    await supabase.from('tenants')
      .update({ consent_status: 'pending' })
      .eq('id', tenantId)

    return NextResponse.json({ success: true, preview: emailBody })
  } catch (err: any) {
    console.error('Send consent email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
