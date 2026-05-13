create table if not exists property_listings (
  id uuid primary key,
  created_at timestamptz default now(),
  status text not null default 'INCOMPLETE',

  agent_name text not null,
  agent_email text not null,
  agent_phone text not null,

  property_title text not null,
  property_type text not null,
  address text not null,
  city text not null,
  neighborhood text not null,
  gps_link text,
  bedrooms numeric not null,
  bathrooms numeric not null,
  surface_sqm numeric not null,
  price numeric not null,
  commission text not null,

  owner_name text not null,
  owner_phone text not null,
  owner_email text not null,
  ownership_status text,

  notes text,
  files jsonb not null default '[]'::jsonb
);

-- Create this bucket in Supabase Storage UI:
-- Bucket name: property-documents
-- Public bucket: OFF / private

alter table property_listings enable row level security;

-- Keep writes private. The server uses the service role key, so no public insert policy is needed.
