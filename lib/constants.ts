// ─── SITES ─────────────────────────────────────────────
export const SITES = [
  {
    id: 0, name: "Tour Bergame", loc: "Paris 15e", surf: "3 200 m²", type: "Bureaux",
    red: 18, conso: 694, ref: 847,
    lat: 48.8418, lng: 2.2945, zone: "H1b",
    address: "15 rue Lecourbe, 75015 Paris",
    puissance: 250, puissancePeak: 187,
    benchmark: { sectorAvg: 820, bestClass: 560, p25: 920, p75: 680, label: "Bureaux Île-de-France" },
  },
  {
    id: 1, name: "Siège Nanterre", loc: "Nanterre", surf: "1 800 m²", type: "Bureaux",
    red: 12, conso: 633, ref: 720,
    lat: 48.8924, lng: 2.2070, zone: "H1b",
    address: "3 bd Gambetta, 92000 Nanterre",
    puissance: 160, puissancePeak: 134,
    benchmark: { sectorAvg: 820, bestClass: 560, p25: 920, p75: 680, label: "Bureaux Île-de-France" },
  },
  {
    id: 2, name: "Entrepôt Roissy", loc: "CDG", surf: "1 200 m²", type: "Logistique",
    red: 8, conso: 506, ref: 550,
    lat: 49.0097, lng: 2.5479, zone: "H1a",
    address: "ZAC Paris Nord II, 95700 Roissy",
    puissance: 400, puissancePeak: 312,
    benchmark: { sectorAvg: 430, bestClass: 280, p25: 500, p75: 380, label: "Logistique Île-de-France" },
  },
]

// ─── ACTIONS ────────────────────────────────────────────
export const ACTIONS = [
  { id: 1, label: "Pilotage intelligent GTB", cat: "Gestion technique", urg: "urgent", tri: 3.5, impact: 8, cee: 680 },
  { id: 2, label: "LED + détection présence", cat: "Éclairage", urg: "urgent", tri: 2.5, impact: 6, cee: 420 },
  { id: 3, label: "PAC — dépose chaudière gaz", cat: "Chauffage", urg: "medium", tri: 7.0, impact: 14, cee: 1100 },
  { id: 4, label: "PV autoconsommation toiture", cat: "Production", urg: "planned", tri: 8.5, impact: 5, cee: 0 },
  { id: 5, label: "Isolation toiture-terrasse", cat: "Enveloppe", urg: "planned", tri: 11.0, impact: 9, cee: 580 },
]

// ─── DEADLINES ──────────────────────────────────────────
export const DEADLINES = [
  { label: "Déclaration OPERAT 2025", date: "30 sept. 2026", days: 135, t: "high" },
  { label: "Audit énergétique (>2,75 GWh)", date: "11 oct. 2026", days: 146, t: "high" },
  { label: "Dossier de modulation 2030", date: "30 sept. 2027", days: 500, t: "med" },
]

// ─── TENANTS ────────────────────────────────────────────
export const TENANTS: Record<number, any[]> = {
  0: [
    { id: "t0_0", floor: "RDC + Communs", company: "Parties communes (propriétaire)", surface: 460, prm: "50001234567890", email: null, role: "owner", consent: "owner", conso: 43200, surface_pct: 14 },
    { id: "t0_1", floor: "R+1", company: "Spaces Coworking Paris", surface: 420, prm: "50054321098765", email: "admin@spaces-coworking.fr", role: "locataire", consent: "refused", conso: null, surface_pct: 13 },
    { id: "t0_2", floor: "R+2 / R+3", company: "KPMG Advisory France", surface: 680, prm: "50098765432109", email: "facilities@kpmg-advisory.fr", role: "locataire", consent: "pending", conso: null, surface_pct: 21 },
    { id: "t0_3", floor: "R+4 / R+5", company: "Cabinet Mazars SAS", surface: 640, prm: "50012345678901", email: "office-manager@mazars.fr", role: "locataire", consent: "granted", conso: 89400, surface_pct: 20 },
    { id: "t0_4", floor: "R+6 / R+7", company: "Groupe Berlier (siège)", surface: 560, prm: "50034567890123", email: null, role: "owner", consent: "owner", conso: 67800, surface_pct: 17 },
    { id: "t0_5", floor: "R+8 (terrasse technique)", company: "Locaux techniques", surface: 440, prm: "50076543210987", email: null, role: "owner", consent: "owner", conso: 32000, surface_pct: 14 },
  ],
  1: [
    { id: "t1_0", floor: "RDC + Communs", company: "Parties communes (propriétaire)", surface: 280, prm: "50009876543210", email: null, role: "owner", consent: "owner", conso: 28400, surface_pct: 16 },
    { id: "t1_1", floor: "R+1 / R+2", company: "Deloitte Nanterre", surface: 760, prm: "50011223344556", email: "fm.nanterre@deloitte.fr", role: "locataire", consent: "granted", conso: 74200, surface_pct: 42 },
    { id: "t1_2", floor: "R+3", company: "BNP Paribas Real Estate", surface: 380, prm: "50066778899001", email: "immo@bnpre.fr", role: "locataire", consent: "pending", conso: null, surface_pct: 21 },
    { id: "t1_3", floor: "R+4 (plateau libre)", company: "Non loué", surface: 380, prm: null, email: null, role: "vacant", consent: "n/a", conso: null, surface_pct: 21 },
  ],
  2: [
    { id: "t2_0", floor: "Zone A — Quais 1-8", company: "Amazon Logistics", surface: 480, prm: "50005544332211", email: "facility.roissy@amazon.fr", role: "locataire", consent: "granted", conso: 42100, surface_pct: 40 },
    { id: "t2_1", floor: "Zone B — Quais 9-16", company: "La Redoute Logistique", surface: 360, prm: "50009988776655", email: "direction@laredoute-logistique.fr", role: "locataire", consent: "pending", conso: null, surface_pct: 30 },
    { id: "t2_2", floor: "Mezzanine + bureaux", company: "Groupe Berlier (gestion site)", surface: 200, prm: "50004433221100", email: null, role: "owner", consent: "owner", conso: 12800, surface_pct: 17 },
    { id: "t2_3", floor: "Zone technique", company: "Locaux techniques", surface: 160, prm: "50001122334455", email: null, role: "owner", consent: "owner", conso: 8900, surface_pct: 13 },
  ],
}

// ─── BACS DATA ──────────────────────────────────────────
export const BACS_DATA: Record<number, any> = {
  0: {
    puissance_chauffage: 220, puissance_clim: 180, puissance_ecs: 45,
    surface: 3200, annee_installation: 2008,
    systemes: {
      chauffage: { label: "Chauffage", kw: 220, classe: "C", has_regulation: true, has_programmation: false, has_monitoring: false, has_telereleve: false },
      clim: { label: "Climatisation", kw: 180, classe: "C", has_regulation: true, has_programmation: true, has_monitoring: false, has_telereleve: false },
      ecs: { label: "ECS", kw: 45, classe: "D", has_regulation: false, has_programmation: false, has_monitoring: false, has_telereleve: false },
      ventilation: { label: "Ventilation", kw: 35, classe: "D", has_regulation: false, has_programmation: false, has_monitoring: false, has_telereleve: false },
      eclairage: { label: "Éclairage", kw: 60, classe: "C", has_regulation: true, has_programmation: false, has_monitoring: false, has_telereleve: false },
    },
    gtb_installed: false, classe_globale: "C", objectif_classe: "B",
    echeance: "1er jan. 2025", statut: "non_conforme",
    economie_estimee_pct: 15, capex_estime: 42000, cee_estime: 680000,
  },
  1: {
    puissance_chauffage: 130, puissance_clim: 110, puissance_ecs: 28,
    surface: 1800, annee_installation: 2012,
    systemes: {
      chauffage: { label: "Chauffage", kw: 130, classe: "B", has_regulation: true, has_programmation: true, has_monitoring: false, has_telereleve: false },
      clim: { label: "Climatisation", kw: 110, classe: "B", has_regulation: true, has_programmation: true, has_monitoring: false, has_telereleve: false },
      ecs: { label: "ECS", kw: 28, classe: "C", has_regulation: true, has_programmation: false, has_monitoring: false, has_telereleve: false },
      ventilation: { label: "Ventilation", kw: 22, classe: "C", has_regulation: true, has_programmation: false, has_monitoring: false, has_telereleve: false },
      eclairage: { label: "Éclairage", kw: 40, classe: "B", has_regulation: true, has_programmation: true, has_monitoring: false, has_telereleve: false },
    },
    gtb_installed: false, classe_globale: "B", objectif_classe: "A",
    echeance: "8 avr. 2027", statut: "en_cours",
    economie_estimee_pct: 12, capex_estime: 28000, cee_estime: 420000,
  },
  2: {
    puissance_chauffage: 380, puissance_clim: 0, puissance_ecs: 60,
    surface: 1200, annee_installation: 2005,
    systemes: {
      chauffage: { label: "Chauffage", kw: 380, classe: "D", has_regulation: false, has_programmation: false, has_monitoring: false, has_telereleve: false },
      clim: { label: "Climatisation", kw: 0, classe: null, has_regulation: false, has_programmation: false, has_monitoring: false, has_telereleve: false },
      ecs: { label: "ECS", kw: 60, classe: "D", has_regulation: false, has_programmation: false, has_monitoring: false, has_telereleve: false },
      ventilation: { label: "Ventilation", kw: 55, classe: "D", has_regulation: false, has_programmation: false, has_monitoring: false, has_telereleve: false },
      eclairage: { label: "Éclairage", kw: 120, classe: "D", has_regulation: false, has_programmation: false, has_monitoring: false, has_telereleve: false },
    },
    gtb_installed: false, classe_globale: "D", objectif_classe: "B",
    echeance: "1er jan. 2025", statut: "non_conforme",
    economie_estimee_pct: 22, capex_estime: 68000, cee_estime: 1100000,
  },
}

export const CLASSE_CFG: Record<string, any> = {
  A: { color: "#00E29E", bg: "rgba(0,226,158,.1)", border: "rgba(0,226,158,.25)", label: "Classe A", desc: "Haute performance — Monitoring temps réel, optimisation IA" },
  B: { color: "#7BAEFB", bg: "rgba(79,142,247,.1)", border: "rgba(79,142,247,.25)", label: "Classe B", desc: "Performance avancée — Régulation dynamique et reporting auto" },
  C: { color: "#FBBF24", bg: "rgba(251,191,36,.1)", border: "rgba(251,191,36,.25)", label: "Classe C", desc: "Performance standard — Régulation basique et programmation" },
  D: { color: "#F87171", bg: "rgba(239,68,68,.1)", border: "rgba(239,68,68,.25)", label: "Classe D", desc: "Non conforme — Absence de régulation automatique" },
}

// ─── STRIPE PLANS ────────────────────────────────────────
export const STRIPE_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'price_starter',
    features: [
      '3 bâtiments maximum',
      'Déclaration OPERAT manuelle',
      'Tableau de bord BACS',
      'Export CSV OPERAT',
      'Support email',
    ],
    limit_buildings: 3,
    limit_users: 2,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_pro',
    features: [
      '15 bâtiments maximum',
      'Connexion OPERAT API réelle',
      'Connexion ENEDIS Data Connect',
      'Import factures IA (PDF)',
      'Génération dossiers IA illimitée',
      'Simulation financement CPE/CEE',
      'Support prioritaire',
    ],
    limit_buildings: 15,
    limit_users: 10,
  },
  {
    id: 'business',
    name: 'Business',
    price: 799,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || 'price_business',
    features: [
      'Bâtiments illimités',
      'Toutes les intégrations API',
      'Gestion multi-équipes',
      'SLA garanti 99,9%',
      'Onboarding dédié',
      'Account manager dédié',
      'Rapports sur mesure',
    ],
    limit_buildings: 9999,
    limit_users: 9999,
  },
]
