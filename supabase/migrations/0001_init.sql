-- SustainKit POC schema
-- No auth/RLS yet (single shared household for the POC). Every table carries
-- household_id so real multi-household auth can be layered in later without
-- a data migration.

create extension if not exists "pgcrypto";

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Default Household',
  created_at timestamptz not null default now()
);

create type inventory_category as enum (
  'very_short_term',
  'short_term',
  'mid_term',
  'long_term'
);

create type inventory_status as enum (
  'active',
  'consumed',
  'discarded'
);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  category inventory_category not null,
  quantity numeric not null default 1,
  unit text not null default 'unit',
  purchased_at date not null default current_date,
  expiry_date date,
  status inventory_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_household_status_idx
  on inventory_items (household_id, status);

create type meal_slot as enum (
  'breakfast',
  'lunch',
  'snack',
  'dinner'
);

create table if not exists recipe_history (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  meal_slot meal_slot not null,
  recipe_name text not null,
  recipe_json jsonb not null,
  items_used jsonb not null default '[]'::jsonb,
  served_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists recipe_history_household_slot_date_idx
  on recipe_history (household_id, meal_slot, served_date desc);

create table if not exists restock_checks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  checked_at timestamptz not null default now(),
  needs_restock boolean not null default false,
  reasoning text,
  items_low jsonb not null default '[]'::jsonb,
  acknowledged boolean not null default false
);

create index if not exists restock_checks_household_checked_idx
  on restock_checks (household_id, checked_at desc);

-- Seed a single default household for the POC.
insert into households (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Default Household')
on conflict (id) do nothing;
