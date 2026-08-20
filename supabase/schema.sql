-- AstroLive Daily — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "uuid-ossp";

-- ── users ──────────────────────────────────────────────
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  whatsapp_id text unique,
  name text,
  phone text,
  date_of_birth date,
  birth_time time,
  birth_place text,
  latitude double precision,
  longitude double precision,
  timezone text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── astrology_profiles ─────────────────────────────────
create table if not exists astrology_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  sun_sign text,
  moon_sign text,
  ascendant text,
  nakshatra text,
  planetary_data jsonb default '{}'::jsonb,
  houses_data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists astrology_profiles_user_id_key on astrology_profiles(user_id);

-- ── subscriptions ──────────────────────────────────────
create type subscription_status as enum ('FREE_TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED');
create type subscription_plan as enum ('FREE', 'PREMIUM');

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  trial_start timestamptz,
  trial_end timestamptz,
  plan subscription_plan not null default 'FREE',
  status subscription_status not null default 'FREE_TRIAL',
  created_at timestamptz not null default now()
);
create unique index if not exists subscriptions_user_id_key on subscriptions(user_id);

-- ── conversations ──────────────────────────────────────
create type conversation_topic as enum
  ('LOVE', 'CAREER', 'FINANCE', 'STUDIES', 'FAMILY', 'GENERAL', 'COMPATIBILITY');

create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  user_message text not null,
  ai_response text not null,
  topic conversation_topic default 'GENERAL',
  created_at timestamptz not null default now()
);
create index if not exists conversations_user_id_idx on conversations(user_id);

-- ── engagement ─────────────────────────────────────────
create table if not exists engagement (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  horoscope_sent integer not null default 0,
  horoscope_opened integer not null default 0,
  questions_asked integer not null default 0,
  cosmic_cards_shared integer not null default 0,
  website_clicks integer not null default 0,
  referral_signups integer not null default 0,
  streak_days integer not null default 0,
  last_active_at timestamptz
);
create unique index if not exists engagement_user_id_key on engagement(user_id);

-- ── referrals ──────────────────────────────────────────
create type referral_status as enum ('PENDING', 'CONVERTED');

create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_user_id uuid not null references users(id) on delete cascade,
  referral_code text unique not null,
  referred_user_id uuid references users(id) on delete set null,
  status referral_status not null default 'PENDING',
  created_at timestamptz not null default now()
);
create index if not exists referrals_code_idx on referrals(referral_code);

-- ── Row Level Security ─────────────────────────────────
-- For the hackathon prototype: service-role key (backend/n8n) bypasses RLS entirely,
-- so these policies only matter if you ever call Supabase from the browser directly.
-- Locked down by default; loosen only if you add client-side reads.
alter table users enable row level security;
alter table astrology_profiles enable row level security;
alter table subscriptions enable row level security;
alter table conversations enable row level security;
alter table engagement enable row level security;
alter table referrals enable row level security;