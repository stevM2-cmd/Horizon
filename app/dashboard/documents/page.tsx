'use client'
import { useState } from 'react'
import { SITES } from '@/lib/constants'
import { FileText, Download, Loader2, CheckCircle2, Upload } from 'lucide-react'

const DOC_TYPES = [
  { id: 'conformite', label: 'Dossier conformité décret tertiaire', desc: 'Bilan OPERAT, trajectoire, écarts et plan d\'action' },
  { id: 'bacs', label: 'Rapport d\'audit BACS', desc: 'Diagnostic classe A/B/C/D, feuille de route, ROI' },
  { id: 'operat', label: 'Export données OPERAT', desc: 'CSV formaté pour import sur operat.ademe.fr' },
]

export default function DocumentsPage() {
  const [siteId, setSiteId] = useState(0)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generated, setGenerated] = useState<string[]>([])

  const generate = async (type: string) => {
    setGenerating(type)
    const res = await fetch('/api/generate-dossier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, siteId, site: SITES[siteId] }),
    })
    setGenerating(null)
    if (res.ok) {
      setGenerated(p => [...p, type])
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `horizonenergie_${type}_${SITES[siteId].name.replace(/ /g, '_')}.html`
      a.click()
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} color="var(--primary)" /> Documents IA
          </h1>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
            Génération automatique par Claude — Conformité réglementaire
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SITES.map(s => (
            <button key={s.id} onClick={() => setSiteId(s.id)}
              className={siteId === s.id ? 'bp' : 'bg'} style={{ padding: '7px 14px', fontSize: 12 }}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {DOC_TYPES.map(doc => (
          <div key={doc.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{doc.label}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{doc.desc}</div>
            </div>
            {generated.includes(doc.id) && (
              <span className="tag tag-green"><CheckCircle2 size={12} /> Généré</span>
            )}
            <button
              className="bp"
              onClick={() => generate(doc.id)}
              disabled={generating === doc.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
            >
              {generating === doc.id
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Génération...</>
                : <><Download size={14} /> Générer</>
              }
            </button>
          </div>
        ))}

        {/* Import factures */}
        <div className="card" style={{ borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Import de factures</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Parsing automatique PDF/CSV/XLSX par Claude Vision — Extraction des données de consommation
              </div>
            </div>
            <label className="bp" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Upload size={14} />
              Importer
              <input type="file" accept=".pdf,.csv,.xlsx" style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const form = new FormData()
                  form.append('file', file)
                  form.append('siteId', String(siteId))
                  const res = await fetch('/api/upload-invoice', { method: 'POST', body: form })
                  if (res.ok) alert('Facture importée et analysée avec succès')
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
