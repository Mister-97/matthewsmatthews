'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { getResend, PORTAL_FROM } from '@/lib/resend'

const SITE_URL = 'https://matthewsmatthews.com'

async function isAdmin(userId: string) {
  const admin = createAdminSupabase()
  const { data } = await admin.from('admins').select('id').eq('id', userId).single()
  return Boolean(data)
}

async function requireAdmin() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) return null
  return user
}

export async function adminSignIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: 'Invalid email or password.' }
  }

  if (!(await isAdmin(data.user.id))) {
    await supabase.auth.signOut()
    return { error: 'This account does not have admin access.' }
  }

  return {}
}

export async function adminSignOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/admin')
}

export type AdminMaintenanceRequest = {
  id: string
  description: string
  urgency: string
  status: 'submitted' | 'in_progress' | 'done'
  createdAt: string
  tenantName: string
  tenantUnit: string
  photoUrl: string | null
}

export async function getAllRequests(): Promise<AdminMaintenanceRequest[]> {
  if (!(await requireAdmin())) return []

  const admin = createAdminSupabase()
  const { data: requests } = await admin
    .from('maintenance_requests')
    .select('id, description, urgency, status, photo_url, created_at, tenants(name, unit)')
    .order('created_at', { ascending: false })

  return Promise.all(
    (requests ?? []).map(async (r: any) => {
      let photoUrl: string | null = null
      if (r.photo_url) {
        const { data } = await admin.storage.from('maintenance-photos').createSignedUrl(r.photo_url, 3600)
        photoUrl = data?.signedUrl ?? null
      }
      return {
        id: r.id,
        description: r.description,
        urgency: r.urgency,
        status: r.status,
        createdAt: r.created_at,
        tenantName: r.tenants?.name ?? 'Unknown',
        tenantUnit: r.tenants?.unit ?? '',
        photoUrl,
      }
    })
  )
}

export async function updateRequestStatus(id: string, status: 'submitted' | 'in_progress' | 'done') {
  if (!(await requireAdmin())) return { error: 'Not authorized.' }

  const admin = createAdminSupabase()
  const { error } = await admin
    .from('maintenance_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'Could not update status.' }
  return {}
}

export type AdminMessage = { id: string; sender: 'tenant' | 'admin'; body: string; created_at: string }
export type AdminMessageThread = {
  tenantId: string
  tenantName: string
  tenantUnit: string
  messages: AdminMessage[]
}

export async function getAllMessageThreads(): Promise<AdminMessageThread[]> {
  if (!(await requireAdmin())) return []

  const admin = createAdminSupabase()
  const { data } = await admin
    .from('messages')
    .select('id, tenant_id, sender, body, created_at, tenants(name, unit)')
    .order('created_at', { ascending: true })

  const threads = new Map<string, AdminMessageThread>()
  for (const m of (data ?? []) as any[]) {
    if (!threads.has(m.tenant_id)) {
      threads.set(m.tenant_id, {
        tenantId: m.tenant_id,
        tenantName: m.tenants?.name ?? 'Unknown',
        tenantUnit: m.tenants?.unit ?? '',
        messages: [],
      })
    }
    threads.get(m.tenant_id)!.messages.push({ id: m.id, sender: m.sender, body: m.body, created_at: m.created_at })
  }

  return Array.from(threads.values()).sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1]?.created_at ?? ''
    const bLast = b.messages[b.messages.length - 1]?.created_at ?? ''
    return bLast.localeCompare(aLast)
  })
}

export async function replyToMessage(tenantId: string, body: string) {
  if (!(await requireAdmin())) return { error: 'Not authorized.' }
  if (!body?.trim()) return { error: 'Message cannot be empty.' }

  const admin = createAdminSupabase()
  const { error } = await admin.from('messages').insert({
    tenant_id: tenantId,
    sender: 'admin',
    body: body.trim(),
  })

  if (error) return { error: 'Could not send reply.' }

  const { data: tenant } = await admin.from('tenants').select('email').eq('id', tenantId).single()
  if (tenant?.email) {
    try {
      await getResend().emails.send({
        from: PORTAL_FROM,
        to: tenant.email,
        subject: 'New message from Matthews & Matthews',
        text: `${body.trim()}\n\nView and reply in your tenant portal: ${SITE_URL}/login`,
      })
    } catch {
      // Notification email is best-effort — the reply itself was saved successfully above.
    }
  }

  return {}
}

export type AdminTenant = { id: string; name: string; unit: string; email: string | null; createdAt: string }

export async function getAllTenants(): Promise<AdminTenant[]> {
  if (!(await requireAdmin())) return []

  const admin = createAdminSupabase()
  const { data } = await admin
    .from('tenants')
    .select('id, name, unit, email, created_at')
    .order('created_at', { ascending: false })

  return (data ?? []).map((t) => ({ id: t.id, name: t.name, unit: t.unit, email: t.email, createdAt: t.created_at }))
}

export async function createTenant(formData: FormData) {
  if (!(await requireAdmin())) return { error: 'Not authorized.' }

  const name = formData.get('name') as string
  const unit = formData.get('unit') as string
  const email = formData.get('email') as string

  if (!name?.trim() || !unit?.trim() || !email?.trim()) {
    return { error: 'Name, unit, and email are all required.' }
  }

  const admin = createAdminSupabase()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
    redirectTo: `${SITE_URL}/set-password`,
  })

  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes('already been registered')) {
      return { error: 'This email already has an account.' }
    }
    return { error: 'Could not invite this tenant. Please check the email and try again.' }
  }

  const { error: insertError } = await admin.from('tenants').insert({
    id: data.user.id,
    name: name.trim(),
    unit: unit.trim(),
    email: email.trim(),
  })

  if (insertError) {
    return { error: 'Invite sent, but could not save tenant details. Contact support.' }
  }

  return {}
}

export type AdminOverview = { openRequests: number; totalTenants: number; totalMessages: number }

export async function getAdminOverview(): Promise<AdminOverview> {
  if (!(await requireAdmin())) return { openRequests: 0, totalTenants: 0, totalMessages: 0 }

  const admin = createAdminSupabase()
  const [requests, tenants, messages] = await Promise.all([
    admin.from('maintenance_requests').select('id', { count: 'exact', head: true }).neq('status', 'done'),
    admin.from('tenants').select('id', { count: 'exact', head: true }),
    admin.from('messages').select('id', { count: 'exact', head: true }),
  ])

  return {
    openRequests: requests.count ?? 0,
    totalTenants: tenants.count ?? 0,
    totalMessages: messages.count ?? 0,
  }
}
