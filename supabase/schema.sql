-- Where2Meet.Me Database Schema
-- Run this in your Supabase SQL editor to set up tables

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Searches table
create table if not exists searches (
  id uuid primary key default uuid_generate_v4(),
  short_code text unique not null,
  venue_type text not null,
  status text not null default 'collecting' check (status in ('collecting', 'calculating', 'complete')),
  midpoint_lat double precision,
  midpoint_lng double precision,
  created_at timestamptz not null default now()
);

-- Index for share URL lookups
create index if not exists idx_searches_short_code on searches (short_code);

-- Participants table
create table if not exists participants (
  id uuid primary key default uuid_generate_v4(),
  search_id uuid not null references searches(id) on delete cascade,
  label text not null,
  origin_place_id text,
  origin_lat double precision,
  origin_lng double precision,
  origin_display_name text,
  travel_mode text not null default 'driving' check (travel_mode in ('driving', 'transit', 'walking', 'bicycling')),
  travel_time_seconds integer,
  collect_token text unique,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_participants_search_id on participants (search_id);

-- Venues table
create table if not exists venues (
  id uuid primary key default uuid_generate_v4(),
  search_id uuid not null references searches(id) on delete cascade,
  place_id text not null,
  name text not null,
  address text,
  short_address text,
  lat double precision not null,
  lng double precision not null,
  rating double precision,
  user_ratings_total integer,
  photo_reference text,
  fairness_score double precision not null default 0,
  travel_times jsonb not null default '{}'::jsonb
);

create index if not exists idx_venues_search_id on venues (search_id);

-- Row Level Security (enable when auth is added)
-- For now, all data is public (no auth in MVP)
alter table searches enable row level security;
alter table participants enable row level security;
alter table venues enable row level security;

-- Public read access for shared links
create policy "Public read access" on searches for select using (true);
create policy "Public read access" on participants for select using (true);
create policy "Public read access" on venues for select using (true);

-- Public insert for MVP (no auth)
create policy "Public insert" on searches for insert with check (true);
create policy "Public insert" on participants for insert with check (true);
create policy "Public insert" on venues for insert with check (true);

-- Enable realtime for collection flow
alter publication supabase_realtime add table participants;
