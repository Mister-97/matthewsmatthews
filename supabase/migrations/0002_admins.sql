create table admins (
  id uuid primary key references auth.users(id),
  name text not null,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;
