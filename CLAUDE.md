# HorizonEnergie.io — Contexte pour Claude Code

## Qu'est-ce que ce projet ?

SaaS de conformité énergétique pour propriétaires fonciers français.
Cible : décret tertiaire (OPERAT/ADEME), décret BACS, gestion locataires multi-PRM.
Stack : Next.js 14 App Router + Supabase + Claude API + Vercel.

## Configuration requise avant de démarrer

1. Copier `.env.local.example` → `.env.local`
2. Remplir les variables (Supabase URL/KEY, Anthropic KEY, Stripe, ENEDIS, OPERAT)
3. Exécuter le schéma SQL dans Supabase (`docs/schema.sql`)
4. Créer le bucket Storage `invoices` dans Supabase (privé, 10MB, PDF/CSV/XLSX)
5. `npm install` puis `npm run dev`

## Architecture

```
app/
  page.tsx              → redirect vers /dashboard ou /login
  login/page.tsx        → auth Supabase (email + mdp + signup)
  onboarding/page.tsx   → 5 étapes (org → bâtiment → conso → locataires → docs)
  dashboard/
    layout.tsx          → Layout avec Sidebar (state site/global partagé)
    page.tsx            → Vue d'ensemble site + KPIs + trajectoire OPERAT
    plan/page.tsx       → Plan d'action IA
    locataires/page.tsx → Gestion locataires + consentement ENEDIS
    bacs/page.tsx       → Décret BACS (diagnostic + roadmap + ROI)
    documents/page.tsx  → Génération documents IA + import factures
    financement/page.tsx → [NOUVEAU] Simulation CEE / CPE / MaPrimeRénov'
    parametres/page.tsx  → [NOUVEAU] Profil, org, membres, abonnement, intégrations

components/
  Sidebar.tsx           → Navigation + sélecteur de site

lib/
  supabase.ts           → Client navigateur
  supabase-server.ts    → Client serveur (Server Components + Admin)
  constants.ts          → SITES, ACTIONS, TENANTS, BACS_DATA, STRIPE_PLANS
  types.ts              → TypeScript types complets

app/api/
  generate-dossier/route.ts     → Claude API → dossier HTML + export OPERAT CSV
  upload-invoice/route.ts       → Upload PDF → Supabase Storage + parsing Claude Vision
  send-consent-email/route.ts   → Email consentement ENEDIS via Resend + Claude
  generate-bacs-audit/route.ts  → Claude API → audit BACS JSON complet
  operat-sync/route.ts          → [NOUVEAU] API OPERAT réelle (validate/sync/declare)
  enedis/auth/route.ts          → [NOUVEAU] ENEDIS OAuth 2.0 — initiation
  enedis/callback/route.ts      → [NOUVEAU] ENEDIS OAuth 2.0 — échange tokens
  enedis/data/route.ts          → [NOUVEAU] ENEDIS Data Connect — courbes de charge
  stripe/checkout/route.ts      → [NOUVEAU] Stripe checkout session
  stripe/portal/route.ts        → [NOUVEAU] Stripe billing portal
  stripe/webhook/route.ts       → [NOUVEAU] Stripe webhook (sub created/updated/deleted)

middleware.ts           → Protection routes /dashboard + redirect si connecté
docs/schema.sql         → Schéma Supabase complet avec RLS
```

## Modules implémentés

1. **Auth** — Login/signup + onboarding 5 étapes
2. **Dashboard** — Trajectoire OPERAT, KPIs, actions, deadlines réglementaires
3. **Plan d'action** — Filtrage par catégorie, statut, TRI/impact/CEE
4. **Locataires** — Segmentation PRM par étage, funnel consentement, email IA
5. **Décret BACS** — Diagnostic classe A/B/C/D, feuille de route, ROI (4 onglets)
6. **Documents IA** — Génération dossiers Claude + import factures PDF (Vision)
7. **Financement** ✨ — Simulation CEE (prix variable), CPE/tiers-investisseur, MaPrimeRénov', synthèse aides
8. **Paramètres** ✨ — Profil, organisation, membres (invitations), abonnement Stripe, intégrations OPERAT/ENEDIS/Stripe, sécurité
9. **OPERAT API** ✨ — Connexion réelle datahub ADEME, validation clé, sync automatique, déclaration par bâtiment
10. **ENEDIS OAuth** ✨ — OAuth 2.0 complet (auth → callback → refresh token), courbes de charge, données PRM
11. **Stripe** ✨ — Checkout, portail facturation, webhook (plans Starter 99€/Pro 299€/Business 799€)

## Conventions de code

- **Couleurs** : primary=#00E29E, secondary=#00BFD4, bg=#060A17, card=#0E1724
- **Fonts** : Sora (UI) + Fraunces (serif titres)
- **Composants UI** : classes CSS custom (.bp, .bg, .card, .tag, .bar, .tabs)
- **Claude API** : toujours côté serveur (API routes), modèle claude-opus-4-7
- **Supabase RLS** : toujours filtrer par org_id — ne jamais bypasser
- **Stripe** : toujours vérifier session avant checkout/portal

## Réglementation intégrée

- **Décret tertiaire** : objectifs -40% 2030 / -50% 2040 / -60% 2050 sur ref 2010
- **OPERAT** : deadline déclaration 30 sept. 2026 pour consommations 2025
- **Décret BACS** : n°2020-887 — classes A/B/C/D, échéances 2025 (>=290kW) et 2027 (>=70kW)
- **CEE** : 6ème période — fiches BAT-EQ, BAT-TH, BAT-EN
- **ENEDIS** : Data Connect OAuth 2.0 via datahub-enedis.fr

## Commandes utiles

```bash
npm run dev          # Développement local (port 3000)
npm run build        # Build production
npm run lint         # ESLint
vercel --prod        # Déploiement Vercel
```
