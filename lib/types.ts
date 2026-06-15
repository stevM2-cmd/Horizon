export type Plan = 'starter' | 'pro' | 'business'
export type Role = 'admin' | 'member' | 'viewer'
export type ConsentStatus = 'pending' | 'granted' | 'refused' | 'owner' | 'n/a'
export type TenantRole = 'locataire' | 'owner' | 'vacant'
export type Urgency = 'urgent' | 'medium' | 'planned'
export type ActionStatus = 'todo' | 'in_progress' | 'done'
export type BacsClasse = 'A' | 'B' | 'C' | 'D'
export type DossierType = 'conformite' | 'bacs' | 'operat'

export interface Organization {
  id: string
  name: string
  siret?: string
  plan: Plan
  stripe_customer_id?: string
  stripe_subscription_id?: string
  stripe_price_id?: string
  operat_connected: boolean
  enedis_connected: boolean
  enedis_access_token?: string
  enedis_refresh_token?: string
  enedis_token_expiry?: string
  operat_api_key?: string
  created_at: string
}

export interface Profile {
  id: string
  org_id: string
  full_name?: string
  role: Role
  created_at: string
}

export interface Building {
  id: string
  org_id: string
  name: string
  address?: string
  city?: string
  lat?: number
  lng?: number
  surface_m2?: number
  activity_type?: string
  climate_zone?: string
  ref_year: number
  ref_consumption?: number
  current_reduction: number
  operat_id?: string
  puissance_souscrite?: number
  created_at: string
}

export interface EnergyDeclaration {
  id: string
  building_id: string
  year: number
  electricity_kwh: number
  gas_kwh: number
  heat_kwh: number
  water_m3: number
  total_kwh_m2?: number
  source: 'manual' | 'operat' | 'enedis' | 'invoice'
  declared_at: string
}

export interface Tenant {
  id: string
  building_id: string
  org_id: string
  company_name: string
  floor_label?: string
  surface_m2?: number
  prm?: string
  email?: string
  role: TenantRole
  consent_status: ConsentStatus
  consent_granted_at?: string
  conso_kwh?: number
  created_at: string
}

export interface ActionItem {
  id: string
  building_id: string
  label: string
  category?: string
  urgency: Urgency
  impact_pct?: number
  tri_years?: number
  cee_kwh_cumac: number
  capex_estimate?: number
  status: ActionStatus
  created_at: string
}

export interface BacsAudit {
  id: string
  building_id: string
  classe_actuelle?: BacsClasse
  classe_objectif?: BacsClasse
  statut: string
  puissance_chauffage?: number
  puissance_clim?: number
  puissance_ecs?: number
  gtb_installed: boolean
  audit_content?: Record<string, unknown>
  audited_at: string
}

export interface Dossier {
  id: string
  org_id: string
  building_id?: string
  user_id: string
  building_name?: string
  content?: Record<string, unknown>
  type: DossierType
  generated_at: string
}

export interface StripePlan {
  id: string
  name: string
  price: number
  priceId: string
  features: string[]
  limit_buildings: number
  limit_users: number
}
