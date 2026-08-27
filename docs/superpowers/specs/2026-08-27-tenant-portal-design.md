# Tenant Portal Design

Date: 2026-08-27

## Purpose

Replace the external TurboTenant tenant portal link with a self-built
tenant portal: login, a maintenance request form, and a rent-payment
tab showing a static Zelle QR code. The public marketing page's look
and content stay as-is.

## Scope

- Convert the current static `index.html` into a Next.js (App Router)
  project, keeping the existing marketing page content/styling intact.
- Add Supabase for auth, database, and file storage.
- Tenant accounts are created manually by the landlord in the Supabase
  dashboard — no self-signup flow.
- A simple password-gated `/admin` page for the landlord to view and
  update maintenance requests across all tenants.

Out of scope: rent amount tracking, payment confirmation/receipts,
tenant self-signup, lease document storage, messaging.

## Architecture

- **Framework:** Next.js App Router, deployed to the existing Vercel
  project (`mr-97s-projects/matthewsmatthews`).
- **Backend:** Supabase (project ref `yerakdlpqrrcumgtqhzx`) for
  Postgres, Auth, and Storage.
- **Repo:** same repo, `github.com/Mister-97/matthewsmatthews`.

## Auth

- Supabase Auth, email/password.
- Landlord creates each tenant's login via the Supabase dashboard
  (Authentication → Users). No signup UI in the app.
- Homepage's "Access Tenant Portal" button links to `/login` instead
  of the external TurboTenant URL.
- `/login` — email/password form, redirects to `/dashboard` on
  success.
- `/dashboard` routes are auth-gated via Supabase session; unauthenticated
  visitors are redirected to `/login`.

## Database schema (Supabase Postgres)

```sql
create table tenants (
  id uuid primary key references auth.users(id),
  name text not null,
  unit text not null,
  created_at timestamptz not null default now()
);

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
```

Row Level Security:
- `tenants`: a tenant can select their own row (`id = auth.uid()`).
- `maintenance_requests`: a tenant can select/insert rows where
  `tenant_id = auth.uid()`. No update/delete from the client — status
  changes happen through the admin page using the Supabase service
  role key (server-side only, via a Next.js API route/server action),
  which bypasses RLS.

## Storage

- Supabase Storage bucket `maintenance-photos`, private.
- Tenant dashboard uploads go through a signed upload URL (or a
  server action using the service role key) so the bucket can stay
  private.
- Admin page reads photos via signed URLs generated server-side.

## Tenant Dashboard (`/dashboard`)

Two tabs, matching the site's existing gold/charcoal visual style:

1. **Maintenance**
   - Form: description (textarea), urgency (select: low/medium/high/emergency),
     photo (optional file input).
   - On submit: uploads photo (if any) to Storage, inserts a row into
     `maintenance_requests` tied to the logged-in tenant.
   - Below the form: list of the tenant's own past requests, each
     showing description, urgency, status badge, and submitted date.

2. **Pay Rent**
   - Static Zelle QR code encoding `330-719-6908`.
   - Business name/contact shown as text below the QR.
   - Note instructing the tenant to include their name and unit in the
     Zelle memo.
   - No amount encoding, no payment tracking/confirmation.

## Admin Page (`/admin`)

- Gated by a simple password check (matches the pattern used on the
  user's other small admin pages — a shared password checked
  server-side, not a full Supabase-authenticated role system, since
  only the landlord uses this).
- Lists all maintenance requests across all tenants: tenant name/unit,
  description, urgency, photo (signed URL), status, submitted date.
- Status dropdown per row (submitted → in_progress → done) that
  updates the row via a server action using the service role key.

## Error handling

- Login failure: inline error message on `/login`, no redirect.
- Maintenance form submit failure (upload or insert error): inline
  error message, form retains entered values, no partial DB row left
  behind (upload happens before insert; if upload succeeds but insert
  fails, the orphaned file is acceptable — low volume, manual cleanup
  if it ever matters).
- Admin status update failure: inline error, row reverts to previous
  status in the UI.

## Testing

Manual verification (no automated test suite for this small app):
1. Create a test tenant in Supabase Auth + `tenants` table.
2. Log in at `/login`, confirm redirect to `/dashboard`.
3. Submit a maintenance request with a photo; confirm it appears in
   the tenant's own request list with status "submitted".
4. Log into `/admin`, confirm the request appears with the correct
   tenant name/unit and photo.
5. Change status to "in_progress" in admin; confirm the tenant sees
   the updated status on next dashboard load.
6. Scan the Zelle QR code on the Pay Rent tab and confirm it resolves
   to 330-719-6908.
7. Confirm the public marketing page (`/`) still renders identically
   to the current static site, and "Access Tenant Portal" now links
   to `/login`.
