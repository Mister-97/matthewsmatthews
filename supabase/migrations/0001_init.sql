-- supabase/migrations/0001_init.sql

create table tenants (
  id uuid primary key references auth.users(id),
  name text not null,
  unit text not null,
  created_at timestamptz not null default now()
);

alter table tenants enable row level security;

create policy "Tenants can read their own row"
on tenants for select
to authenticated
using (id = auth.uid());

create type urgency_level as enum ('low', 'medium', 'high', 'emergency');
create type request_status as enum ('submitted', 'in_progress', 'done');

create table maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  description text not null,
  urgency urgency_level not null default 'medium',
  photo_url text,
  status request_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table maintenance_requests enable row level security;

create policy "Tenants can read their own requests"
on maintenance_requests for select
to authenticated
using (tenant_id = auth.uid());

create policy "Tenants can insert their own requests"
on maintenance_requests for insert
to authenticated
with check (tenant_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('maintenance-photos', 'maintenance-photos', false)
on conflict (id) do nothing;

create policy "Tenants can upload their own photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'maintenance-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
