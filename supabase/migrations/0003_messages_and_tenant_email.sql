alter table tenants add column if not exists email text;

create table messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  sender text not null check (sender in ('tenant', 'admin')),
  body text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Tenants can read their own messages"
on messages for select
to authenticated
using (tenant_id = auth.uid());

create policy "Tenants can insert their own messages"
on messages for insert
to authenticated
with check (tenant_id = auth.uid() and sender = 'tenant');
