-- ══════════════════════════════════════════════
-- HorizonEnergie.io — Schéma Supabase complet
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════

-- Organisations (multi-tenant)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  siret text,
  plan text default 'starter', -- starter | pro | business
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  operat_connected boolean default false,
  operat_api_key text,
  enedis_connected boolean default false,
  enedis_access_token text,
  enedis_refresh_token text,
  enedis_token_expiry timestamptz,
  created_at timestamptz default now()
);

-- Profils utilisateurs
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references organizations(id),
  full_name text,
  role text default 'member', -- admin | member | viewer
  created_at timestamptz default now()
);

-- Bâtiments (EFA)
create table if not exists buildings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  name text not null,
  address text,
  city text,
  lat numeric,
  lng numeric,
  surface_m2 numeric,
  activity_type text,
  climate_zone text,
  ref_year int default 2010,
  ref_consumption numeric,
  current_reduction numeric default 0,
  operat_id text,
  puissance_souscrite numeric,
  created_at timestamptz default now()
);

-- Déclarations annuelles de consommation
create table if not exists energy_declarations (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id),
  year int not null,
  electricity_kwh numeric default 0,
  gas_kwh numeric default 0,
  heat_kwh numeric default 0,
  water_m3 numeric default 0,
  total_kwh_m2 numeric,
  source text default 'manual', -- manual | operat | enedis | invoice
  declared_at timestamptz default now(),
  unique(building_id, year)
);

-- Locataires / PRM
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id),
  org_id uuid references organizations(id),
  company_name text not null,
  floor_label text,
  surface_m2 numeric,
  prm text,
  email text,
  role text default 'locataire', -- locataire | owner | vacant
  consent_status text default 'pending', -- pending | granted | refused | owner | n/a
  consent_granted_at timestamptz,
  conso_kwh numeric,
  created_at timestamptz default now()
);

-- Plan d'actions
create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id),
  label text not null,
  category text,
  urgency text default 'planned', -- urgent | medium | planned
  impact_pct numeric,
  tri_years numeric,
  cee_kwh_cumac numeric default 0,
  capex_estimate numeric,
  status text default 'todo', -- todo | in_progress | done
  created_at timestamptz default now()
);

-- Audit BACS
create table if not exists bacs_audits (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id) unique,
  classe_actuelle text, -- A | B | C | D
  classe_objectif text,
  statut text default 'non_conforme',
  puissance_chauffage numeric,
  puissance_clim numeric,
  puissance_ecs numeric,
  gtb_installed boolean default false,
  audit_content jsonb,
  audited_at timestamptz default now()
);

-- Dossiers générés
create table if not exists dossiers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  building_id uuid references buildings(id),
  user_id uuid references auth.users(id),
  building_name text,
  content jsonb,
  type text default 'conformite', -- conformite | bacs | operat
  generated_at timestamptz default now()
);

-- ── RLS (Row Level Security) ──────────────────────────

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table buildings enable row level security;
alter table energy_declarations enable row level security;
alter table tenants enable row level security;
alter table action_items enable row level security;
alter table bacs_audits enable row level security;
alter table dossiers enable row level security;

-- Helper function
create or replace function get_my_org_id()
returns uuid language sql security definer as $$
  select org_id from profiles where id = auth.uid()
$$;

-- Organizations
create policy "users_see_own_org" on organizations
  for all using (id = get_my_org_id());

-- Profiles
create policy "users_see_own_profile" on profiles
  for all using (id = auth.uid());

create policy "users_see_org_members" on profiles
  for select using (org_id = get_my_org_id());

-- Buildings
create policy "org_isolation_buildings" on buildings
  for all using (org_id = get_my_org_id());

-- Energy declarations
create policy "org_isolation_declarations" on energy_declarations
  for all using (
    building_id in (select id from buildings where org_id = get_my_org_id())
  );

-- Tenants
create policy "org_isolation_tenants" on tenants
  for all using (org_id = get_my_org_id());

-- Action items
create policy "org_isolation_actions" on action_items
  for all using (
    building_id in (select id from buildings where org_id = get_my_org_id())
  );

-- BACS audits
create policy "org_isolation_bacs" on bacs_audits
  for all using (
    building_id in (select id from buildings where org_id = get_my_org_id())
  );

-- Dossiers
create policy "org_isolation_dossiers" on dossiers
  for all using (org_id = get_my_org_id());
