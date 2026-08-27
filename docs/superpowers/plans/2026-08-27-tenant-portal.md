# Tenant Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static marketing site's external TurboTenant link with a self-built tenant portal (login, maintenance requests, Zelle rent-pay QR) plus a landlord admin page.

**Architecture:** Convert the existing static `index.html` into a Next.js 14 App Router project, deployed to the same Vercel project. Supabase provides Postgres (tenants + maintenance_requests tables with RLS), Auth (email/password, admin-created accounts only), and private Storage (maintenance photos). The admin page is gated by a shared password cookie, not a Supabase role, since only the landlord uses it.

**Tech Stack:** Next.js 14 (App Router, TypeScript), @supabase/ssr + @supabase/supabase-js, `qrcode` for the Zelle QR image, Vercel deploy. No automated test framework — this is a small CRUD app with no complex business logic, so each task's "test" step is a concrete manual verification with exact commands and expected output, per the spec's Testing section.

**Spec:** `docs/superpowers/specs/2026-08-27-tenant-portal-design.md`

## Global Constraints

- Public marketing page content/styling must remain visually identical to the current `index.html` — only the "Access Tenant Portal" link target changes (to `/login`).
- Tenant accounts are created manually by the landlord (Supabase dashboard for auth user + SQL insert for the `tenants` row) — no self-signup UI anywhere.
- `maintenance_requests` status changes only happen server-side via the service role key (admin page) — the client-side RLS policies never allow tenant update/delete.
- Zelle QR encodes the phone number `330-719-6908` as plain text, with no amount, no tracking.
- Supabase project ref: `yerakdlpqrrcumgtqhzx`, URL `https://yerakdlpqrrcumgtqhzx.supabase.co`.

---

## File Structure

```
matthewsmatthews/
  app/
    page.tsx                    # marketing homepage (ported from index.html)
    globals.css                 # marketing page styles (ported from index.html <style>)
    login/
      page.tsx                  # tenant login form
      actions.ts                # signIn server action
    dashboard/
      layout.tsx                # auth guard, redirects to /login if no session
      page.tsx                  # tab shell (client component)
      MaintenanceTab.tsx        # form + request list (client component)
      PayRentTab.tsx             # Zelle QR display
      actions.ts                # submitMaintenanceRequest, getMyRequests server actions
    admin/
      page.tsx                  # password gate + request list + status control
      login-form.tsx            # admin password form (client component)
      actions.ts                # adminLogin, updateRequestStatus server actions
  lib/
    supabase/
      client.ts                 # browser Supabase client
      server.ts                 # server Supabase client (RLS-bound, uses cookies)
      admin.ts                  # service-role Supabase client (server-only)
  middleware.ts                  # refreshes Supabase session cookie on every request
  supabase/
    migrations/
      0001_init.sql              # tables, enums, RLS policies, storage policies
  .env.local                     # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
                                  # SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD
  .env.local.example
  package.json
  tsconfig.json
  next.config.ts
```

---

### Task 1: Scaffold the Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx` (placeholder), `.gitignore` additions
- Modify: none (existing `index.html` stays untouched until Task 4)

**Interfaces:**
- Produces: a running Next.js dev server on `localhost:3000`, `npm run dev` / `npm run build` scripts, TypeScript configured.

- [ ] **Step 1: Scaffold with create-next-app**

```bash
cd /Users/a/Downloads/Claudecode/matthewsmatthews
npx --yes create-next-app@latest . --typescript --app --no-tailwind --no-src-dir --import-alias "@/*" --eslint --no-turbopack --use-npm
```

When prompted about the existing `index.html`/`.git` directory, choose to proceed in the current directory (create-next-app allows scaffolding into a non-empty directory that only has a few files).

- [ ] **Step 2: Install Supabase + QR deps**

```bash
npm install @supabase/supabase-js @supabase/ssr qrcode
npm install -D @types/qrcode
```

- [ ] **Step 3: Verify dev server runs**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
kill %1
```

Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js app with Supabase and qrcode deps"
```

---

### Task 2: Supabase schema, RLS, and storage bucket

**Files:**
- Create: `supabase/migrations/0001_init.sql`

**Interfaces:**
- Produces: tables `tenants`, `maintenance_requests` (columns per spec), enums `urgency_level`, `request_status`, RLS policies, storage bucket `maintenance-photos` with an insert policy scoped to `{auth.uid()}/*`.

- [ ] **Step 1: Write the migration**

```sql
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
```

- [ ] **Step 2: Link the Supabase CLI to the project**

```bash
cd /Users/a/Downloads/Claudecode/matthewsmatthews
supabase link --project-ref yerakdlpqrrcumgtqhzx
```

If prompted for a database password, it's the Postgres password from the Supabase dashboard (Project Settings → Database) — retrieve it there if the CLI's stored session token doesn't cover it.

- [ ] **Step 3: Push the migration**

```bash
supabase db push
```

Expected output: confirms `0001_init.sql` applied with no errors.

- [ ] **Step 4: Verify schema in Supabase**

```bash
supabase db diff --linked
```

Expected: no diff (migration matches remote state).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_init.sql
git commit -m "Add tenant portal database schema and RLS policies"
```

---

### Task 3: Supabase client helpers and session middleware

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `middleware.ts`
- Create: `.env.local`, `.env.local.example`

**Interfaces:**
- Produces:
  - `createBrowserSupabase(): SupabaseClient` (from `lib/supabase/client.ts`)
  - `createServerSupabase(): Promise<SupabaseClient>` (from `lib/supabase/server.ts`, reads/writes cookies, RLS-bound)
  - `createAdminSupabase(): SupabaseClient` (from `lib/supabase/admin.ts`, service role, server-only, bypasses RLS)

- [ ] **Step 1: Fetch the anon/publishable key**

```bash
supabase projects api-keys --project-ref yerakdlpqrrcumgtqhzx
```

Copy the `anon` (or `publishable`) key value from the output for `.env.local` below.

- [ ] **Step 2: Write env files**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://yerakdlpqrrcumgtqhzx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<value from Step 1>
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllcmFrZGxwcXJyY3VtZ3RxaHp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgwNDg3NiwiZXhwIjoyMTAzMzgwODc2fQ.P0iJIXz5bxavIUpkJtsPPF8UFt-Iv-hrDrFjT6duofY
ADMIN_PASSWORD=<pick a password for the /admin page, tell the user what it is>
```

Write the same keys (with placeholder values, not real secrets) to `.env.local.example` so the repo documents required env vars without leaking them. Confirm `.env.local` is covered by `.gitignore` (create-next-app includes this by default — verify with `git check-ignore .env.local`, expect it to print the path).

- [ ] **Step 3: Browser client**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Server client**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // called from a Server Component; middleware refreshes the session instead
          }
        },
      },
    }
  )
}
```

- [ ] **Step 5: Admin (service role) client**

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 6: Session refresh middleware**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 7: Verify it builds**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add lib/supabase middleware.ts .env.local.example
git commit -m "Add Supabase client helpers and session middleware"
```

---

### Task 4: Port the marketing homepage to Next.js

**Files:**
- Create: `app/page.tsx`, `app/globals.css`
- Modify: `app/layout.tsx` (import `globals.css`, set metadata from the old `<head>`)
- Delete: `index.html` (replaced by `app/page.tsx`)

**Interfaces:**
- Produces: `/` renders the existing marketing page with identical visual output; "Access Tenant Portal" links (hero button, nav CTA, portal CTA, footer) point to `/login` instead of `https://renter.turbotenant.com/auth/login`.

- [ ] **Step 1: Extract the `<style>` block into `app/globals.css`**

Copy the full CSS from `index.html` lines 113–307 verbatim into `app/globals.css`.

- [ ] **Step 2: Build `app/page.tsx`**

Port the `<body>` content from `index.html` lines 309–507 into a React component, converting `class` → `className`, self-closing void elements, and the vanilla-JS smooth-scroll `<script>` at the bottom into a `useEffect` in a small client component (or drop it — Next.js's default anchor scrolling plus `html { scroll-behavior: smooth }`, already in the CSS, covers the same behavior, so the script can be omitted). Change every `href="https://renter.turbotenant.com/auth/login"` to `href="/login"` and drop the now-unnecessary `target="_blank"` on those links (the portal is now part of the same site).

```typescript
// app/page.tsx
export default function Home() {
  return (
    <>
      <nav aria-label="Main navigation">
        <div className="nav-logo">
          <a href="#hero"><img src="https://i.ibb.co/0yhg1SMc/matthews-property-logo.png" alt="Matthews & Matthews Property Investment & Management" /></a>
        </div>
        <ul className="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#portal">Tenant</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="/login" className="nav-cta">Tenant Login</a></li>
        </ul>
      </nav>

      <section id="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1>Your Home,<br /><em>Expertly Managed.</em></h1>
          <p>We take the stress out of owning and renting property. At Matthews &amp; Matthews, you can count on honest communication, well-kept homes, and a team that actually picks up the phone.</p>
          <a href="/login" className="hero-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Access Tenant Portal
          </a>
        </div>
      </section>

      {/* ...remaining sections ported the same way: features-strip, cards-section#services,
          #portal (button href -> /login), #contact, footer (login link -> /login).
          Every SVG attribute converted to camelCase (strokeWidth, strokeLinecap, strokeLinejoin, viewBox). */}
    </>
  )
}
```

Complete the port by copying every remaining section from `index.html` (features strip, services cards grid, portal CTA, contact cards + map iframe, footer) with the same `class`→`className` and `href` substitutions described above — this is a mechanical port with no new logic, so no additional code decisions are needed beyond what Step 2's excerpt already demonstrates.

- [ ] **Step 3: Update `app/layout.tsx` metadata**

Move the `<title>`, `<meta name="description">`, Open Graph, Twitter, geo, and JSON-LD schema tags from `index.html` lines 8–110 into `app/layout.tsx`'s exported `metadata` object and a `<script type="application/ld+json">` in the layout body, so SEO output matches the original.

- [ ] **Step 4: Delete the old static file**

```bash
git rm index.html
```

- [ ] **Step 5: Verify visually**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000/ | grep -c "Access Tenant Portal"
curl -s http://localhost:3000/ | grep -o 'href="/login"' | wc -l
kill %1
```

Expected: first command prints `1` or more (button text present), second prints `4` (nav CTA, hero button, portal CTA, footer login link all point to `/login`). Then open `http://localhost:3000` in a browser and visually compare against the previous live site to confirm no visual regressions.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/globals.css app/layout.tsx
git commit -m "Port marketing homepage to Next.js, point tenant portal link to /login"
```

---

### Task 5: Tenant login and dashboard auth guard

**Files:**
- Create: `app/login/page.tsx`, `app/login/actions.ts`, `app/dashboard/layout.tsx`

**Interfaces:**
- Consumes: `createServerSupabase()` from Task 3.
- Produces: `signIn(formData: FormData): Promise<{ error?: string }>` (server action, `app/login/actions.ts`); `/dashboard/*` redirects unauthenticated visitors to `/login`.

- [ ] **Step 1: Login server action**

```typescript
// app/login/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  redirect('/dashboard')
}
```

- [ ] **Step 2: Login page**

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await signIn(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #faf8f5)' }}>
      <form action={handleSubmit} style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '360px', border: '1px solid #ede8de' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', marginBottom: '1.5rem', color: '#3a3a3a' }}>Tenant Login</h1>
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Email</label>
        <input name="email" type="email" required style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Password</label>
        <input name="password" type="password" required style={{ width: '100%', padding: '0.6rem', marginBottom: '1.5rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
        {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.8rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          Log In
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: Dashboard auth guard**

```typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
```

- [ ] **Step 4: Verify the guard manually**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/dashboard
kill %1
```

Expected: `307 .../login` (or `200` if curl doesn't follow — confirm the response is a redirect to `/login` by checking headers with `curl -sI http://localhost:3000/dashboard`).

Then, in Supabase dashboard → Authentication → Users, manually create one test tenant (email + password), and:

```sql
-- Run in Supabase SQL editor, using the new user's UUID from the Users table
insert into tenants (id, name, unit) values ('<uuid>', 'Test Tenant', '123 Main St Apt 2');
```

Visit `http://localhost:3000/login` in a browser, sign in with the test tenant's credentials, and confirm redirect to `/dashboard` (which will 404 or render blank until Task 6 — that's expected at this point).

- [ ] **Step 5: Commit**

```bash
git add app/login app/dashboard/layout.tsx
git commit -m "Add tenant login and dashboard auth guard"
```

---

### Task 6: Dashboard shell with tabs

**Files:**
- Create: `app/dashboard/page.tsx`

**Interfaces:**
- Consumes: nothing external yet — `MaintenanceTab` and `PayRentTab` from Tasks 7–8 are stubbed here and filled in there.
- Produces: `/dashboard` renders a two-tab UI (Maintenance / Pay Rent) with client-side tab switching.

- [ ] **Step 1: Build the tab shell**

```typescript
// app/dashboard/page.tsx
'use client'

import { useState } from 'react'
import MaintenanceTab from './MaintenanceTab'
import PayRentTab from './PayRentTab'

export default function DashboardPage() {
  const [tab, setTab] = useState<'maintenance' | 'rent'>('maintenance')

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: '1.5rem', color: '#3a3a3a' }}>Tenant Dashboard</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #ede8de' }}>
        <button
          onClick={() => setTab('maintenance')}
          style={{ padding: '0.8rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, borderBottom: tab === 'maintenance' ? '2px solid #c9942a' : '2px solid transparent', color: tab === 'maintenance' ? '#c9942a' : '#888' }}
        >
          Maintenance
        </button>
        <button
          onClick={() => setTab('rent')}
          style={{ padding: '0.8rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, borderBottom: tab === 'rent' ? '2px solid #c9942a' : '2px solid transparent', color: tab === 'rent' ? '#c9942a' : '#888' }}
        >
          Pay Rent
        </button>
      </div>
      {tab === 'maintenance' ? <MaintenanceTab /> : <PayRentTab />}
    </main>
  )
}
```

- [ ] **Step 2: Temporary stubs so the app builds**

```typescript
// app/dashboard/MaintenanceTab.tsx (temporary — replaced in Task 7)
export default function MaintenanceTab() {
  return <p>Maintenance tab placeholder</p>
}
```

```typescript
// app/dashboard/PayRentTab.tsx (temporary — replaced in Task 8)
export default function PayRentTab() {
  return <p>Pay Rent tab placeholder</p>
}
```

- [ ] **Step 3: Verify tab switching**

```bash
npm run build
```

Expected: build succeeds. Then `npm run dev`, log in as the test tenant, visit `/dashboard`, click both tab buttons, and confirm the active tab's underline/color changes and content swaps.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/MaintenanceTab.tsx app/dashboard/PayRentTab.tsx
git commit -m "Add dashboard tab shell"
```

---

### Task 7: Maintenance request form and list

**Files:**
- Create: `app/dashboard/actions.ts`
- Modify: `app/dashboard/MaintenanceTab.tsx` (replace stub)

**Interfaces:**
- Consumes: `createServerSupabase()` (Task 3), `createBrowserSupabase()` (Task 3).
- Produces: `submitMaintenanceRequest(formData: FormData): Promise<{ error?: string }>` and `getMyRequests(): Promise<MaintenanceRequest[]>` server actions, where
  `type MaintenanceRequest = { id: string; description: string; urgency: 'low'|'medium'|'high'|'emergency'; status: 'submitted'|'in_progress'|'done'; created_at: string }`.

- [ ] **Step 1: Server actions**

```typescript
// app/dashboard/actions.ts
'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export type MaintenanceRequest = {
  id: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  status: 'submitted' | 'in_progress' | 'done'
  created_at: string
}

export async function submitMaintenanceRequest(formData: FormData) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const description = formData.get('description') as string
  const urgency = formData.get('urgency') as string
  const photo = formData.get('photo') as File | null

  if (!description?.trim()) {
    return { error: 'Please describe the issue.' }
  }

  let photo_url: string | null = null
  if (photo && photo.size > 0) {
    const path = `${user.id}/${Date.now()}-${photo.name}`
    const { error: uploadError } = await supabase.storage
      .from('maintenance-photos')
      .upload(path, photo)
    if (uploadError) {
      return { error: 'Photo upload failed. Please try again.' }
    }
    photo_url = path
  }

  const { error: insertError } = await supabase.from('maintenance_requests').insert({
    tenant_id: user.id,
    description: description.trim(),
    urgency,
    photo_url,
  })

  if (insertError) {
    return { error: 'Could not submit your request. Please try again.' }
  }

  return {}
}

export async function getMyRequests(): Promise<MaintenanceRequest[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('maintenance_requests')
    .select('id, description, urgency, status, created_at')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}
```

- [ ] **Step 2: Maintenance tab UI**

```typescript
// app/dashboard/MaintenanceTab.tsx
'use client'

import { useEffect, useState } from 'react'
import { submitMaintenanceRequest, getMyRequests, type MaintenanceRequest } from './actions'

const statusColors: Record<string, string> = {
  submitted: '#888',
  in_progress: '#c9942a',
  done: '#2e7d32',
}

export default function MaintenanceTab() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function loadRequests() {
    setRequests(await getMyRequests())
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSubmitting(true)
    const result = await submitMaintenanceRequest(formData)
    setSubmitting(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    await loadRequests()
    ;(document.getElementById('maintenance-form') as HTMLFormElement)?.reset()
  }

  return (
    <div>
      <form id="maintenance-form" action={handleSubmit} style={{ marginBottom: '2.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>What&apos;s the issue?</label>
        <textarea name="description" required rows={4} style={{ width: '100%', padding: '0.7rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px', fontFamily: 'inherit' }} />

        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Urgency</label>
        <select name="urgency" defaultValue="medium" style={{ width: '100%', padding: '0.7rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px' }}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="emergency">Emergency</option>
        </select>

        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Photo (optional)</label>
        <input name="photo" type="file" accept="image/*" style={{ marginBottom: '1rem' }} />

        {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

        <button type="submit" disabled={submitting} style={{ padding: '0.8rem 1.5rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '1rem', color: '#3a3a3a' }}>Your Requests</h2>
      {requests.length === 0 && <p style={{ color: '#888', fontSize: '0.85rem' }}>No requests yet.</p>}
      {requests.map((r) => (
        <div key={r.id} style={{ border: '1px solid #ede8de', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: statusColors[r.status] }}>{r.status.replace('_', ' ')}</span>
            <span style={{ fontSize: '0.7rem', color: '#888' }}>{new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>{r.description}</p>
          <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'capitalize' }}>Urgency: {r.urgency}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify end-to-end**

```bash
npm run build
```

Expected: build succeeds. Then `npm run dev`, log in as the test tenant, go to the Maintenance tab, submit a request with a description, urgency "high", and a photo. Confirm:
1. The form clears and the new request appears in the list below with status "submitted".
2. In the Supabase dashboard → Table Editor → `maintenance_requests`, the row exists with the correct `tenant_id`, `urgency`, and a non-null `photo_url`.
3. In Supabase dashboard → Storage → `maintenance-photos`, a file exists under a folder named with the tenant's UUID.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/actions.ts app/dashboard/MaintenanceTab.tsx
git commit -m "Add maintenance request form and tenant request list"
```

---

### Task 8: Pay Rent tab with Zelle QR code

**Files:**
- Modify: `app/dashboard/PayRentTab.tsx` (replace stub)

**Interfaces:**
- Produces: renders a QR code image (data URL, generated client-side with `qrcode`) encoding the text `330-719-6908`.

- [ ] **Step 1: Build the tab**

```typescript
// app/dashboard/PayRentTab.tsx
'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

const ZELLE_CONTACT = '330-719-6908'

export default function PayRentTab() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(ZELLE_CONTACT, { width: 240, margin: 2, color: { dark: '#3a3a3a', light: '#ffffff' } }).then(setQrDataUrl)
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '0.5rem', color: '#3a3a3a' }}>Pay Rent via Zelle</h2>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>
        Scan this code in your banking app&apos;s Zelle payment screen, or send to <strong>{ZELLE_CONTACT}</strong> directly.
      </p>
      {qrDataUrl && (
        <img src={qrDataUrl} alt="Zelle QR code" style={{ border: '1px solid #ede8de', borderRadius: '12px', padding: '1rem' }} />
      )}
      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1.5rem' }}>
        Matthews &amp; Matthews Property Investment &amp; Management
      </p>
      <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.5rem', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
        Please include your name and unit address in the Zelle memo so we can match your payment.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify the QR resolves correctly**

```bash
npm run dev &
sleep 3
kill %1
```

Then with the dev server running, log in as the test tenant, open the Pay Rent tab, and scan the QR code with a phone camera. Expected: the phone recognizes the text `330-719-6908` (as a phone number it may offer to call/text/save contact — confirm the digits match exactly).

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/PayRentTab.tsx
git commit -m "Add Zelle QR code to Pay Rent tab"
```

---

### Task 9: Admin page

**Files:**
- Create: `app/admin/page.tsx`, `app/admin/login-form.tsx`, `app/admin/actions.ts`

**Interfaces:**
- Consumes: `createAdminSupabase()` (Task 3).
- Produces: `adminLogin(formData: FormData): Promise<{ error?: string }>`, `updateRequestStatus(id: string, status: 'submitted'|'in_progress'|'done'): Promise<{ error?: string }>` server actions. `/admin` shows a password form when the `admin_session` cookie is absent, otherwise the request list.

- [ ] **Step 1: Admin actions**

```typescript
// app/admin/actions.ts
'use server'

import { cookies } from 'next/headers'
import { createAdminSupabase } from '@/lib/supabase/admin'

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return {}
}

export async function updateRequestStatus(id: string, status: 'submitted' | 'in_progress' | 'done') {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_session')?.value !== process.env.ADMIN_PASSWORD) {
    return { error: 'Not authorized.' }
  }

  const supabase = createAdminSupabase()
  const { error } = await supabase
    .from('maintenance_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'Could not update status.' }
  return {}
}
```

- [ ] **Step 2: Admin login form (client component)**

```typescript
// app/admin/login-form.tsx
'use client'

import { useState } from 'react'
import { adminLogin } from './actions'

export default function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await adminLogin(formData)
    if (result?.error) {
      setError(result.error)
      return
    }
    window.location.reload()
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form action={handleSubmit} style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '320px', border: '1px solid #ede8de' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Admin</h1>
        <input name="password" type="password" placeholder="Password" required style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
        {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.8rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          Log In
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: Admin page (server component + client status control)**

```typescript
// app/admin/page.tsx
import { cookies } from 'next/headers'
import { createAdminSupabase } from '@/lib/supabase/admin'
import AdminLoginForm from './login-form'
import AdminRequestRow from './AdminRequestRow'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthed = cookieStore.get('admin_session')?.value === process.env.ADMIN_PASSWORD

  if (!isAuthed) {
    return <AdminLoginForm />
  }

  const supabase = createAdminSupabase()
  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select('id, description, urgency, status, photo_url, created_at, tenants(name, unit)')
    .order('created_at', { ascending: false })

  const rows = await Promise.all(
    (requests ?? []).map(async (r) => {
      let photoSignedUrl: string | null = null
      if (r.photo_url) {
        const { data } = await supabase.storage
          .from('maintenance-photos')
          .createSignedUrl(r.photo_url, 3600)
        photoSignedUrl = data?.signedUrl ?? null
      }
      return { ...r, photoSignedUrl }
    })
  )

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: '2rem' }}>Maintenance Requests</h1>
      {rows.length === 0 && <p style={{ color: '#888' }}>No requests.</p>}
      {rows.map((r: any) => (
        <AdminRequestRow
          key={r.id}
          id={r.id}
          tenantName={r.tenants?.name ?? 'Unknown'}
          tenantUnit={r.tenants?.unit ?? ''}
          description={r.description}
          urgency={r.urgency}
          status={r.status}
          photoUrl={r.photoSignedUrl}
          createdAt={r.created_at}
        />
      ))}
    </main>
  )
}
```

- [ ] **Step 4: Admin row with status dropdown (client component)**

```typescript
// app/admin/AdminRequestRow.tsx
'use client'

import { useState } from 'react'
import { updateRequestStatus } from './actions'

type Props = {
  id: string
  tenantName: string
  tenantUnit: string
  description: string
  urgency: string
  status: 'submitted' | 'in_progress' | 'done'
  photoUrl: string | null
  createdAt: string
}

export default function AdminRequestRow({ id, tenantName, tenantUnit, description, urgency, status, photoUrl, createdAt }: Props) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [updating, setUpdating] = useState(false)

  async function handleChange(newStatus: 'submitted' | 'in_progress' | 'done') {
    const previous = currentStatus
    setCurrentStatus(newStatus)
    setUpdating(true)
    const result = await updateRequestStatus(id, newStatus)
    setUpdating(false)
    if (result?.error) {
      setCurrentStatus(previous)
    }
  }

  return (
    <div style={{ border: '1px solid #ede8de', borderRadius: '8px', padding: '1.2rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <strong>{tenantName} — {tenantUnit}</strong>
        <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{description}</p>
      <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', textTransform: 'capitalize' }}>Urgency: {urgency}</p>
      {photoUrl && (
        <a href={photoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#c9942a', display: 'block', marginBottom: '0.5rem' }}>
          View photo
        </a>
      )}
      <select
        value={currentStatus}
        disabled={updating}
        onChange={(e) => handleChange(e.target.value as 'submitted' | 'in_progress' | 'done')}
        style={{ padding: '0.4rem 0.6rem', border: '1px solid #ede8de', borderRadius: '6px' }}
      >
        <option value="submitted">Submitted</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
  )
}
```

- [ ] **Step 5: Verify end-to-end**

```bash
npm run build
```

Expected: build succeeds. Then set `ADMIN_PASSWORD` in `.env.local` (Task 3 already added the var — confirm a real value is set), `npm run dev`, visit `/admin`, confirm the password form appears, log in, and confirm the maintenance request created in Task 7 appears with the correct tenant name/unit and a working "View photo" link. Change its status to "In Progress", reload the tenant's `/dashboard` Maintenance tab, and confirm the status badge updated there too.

- [ ] **Step 6: Commit**

```bash
git add app/admin
git commit -m "Add admin page for viewing and updating maintenance requests"
```

---

### Task 10: Deploy and full end-to-end verification

**Files:**
- Modify: none (deployment + verification only)

- [ ] **Step 1: Set Vercel environment variables**

```bash
cd /Users/a/Downloads/Claudecode/matthewsmatthews
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_PASSWORD production
```

Enter the same values used in `.env.local` when prompted for each.

- [ ] **Step 2: Deploy to production**

```bash
vercel --prod
```

Expected: deployment succeeds, prints a production URL.

- [ ] **Step 3: Full manual verification against production, per the spec's Testing section**

1. Visit the production homepage — confirm it renders identically to the previous static site, and "Access Tenant Portal" links go to `/login`.
2. Log in at `/login` with the test tenant credentials — confirm redirect to `/dashboard`.
3. Submit a maintenance request with a photo — confirm it appears in the tenant's own request list with status "submitted".
4. Log into `/admin` — confirm the request appears with correct tenant name/unit and photo link.
5. Change status to "in_progress" in admin — confirm the tenant sees the updated status after reloading `/dashboard`.
6. Scan the Zelle QR on the Pay Rent tab — confirm it resolves to `330-719-6908`.

- [ ] **Step 4: Commit any final fixes discovered during verification, then push**

```bash
git push origin main
```
