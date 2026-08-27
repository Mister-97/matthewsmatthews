'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'

async function isAdmin(userId: string) {
  const admin = createAdminSupabase()
  const { data } = await admin.from('admins').select('id').eq('id', userId).single()
  return Boolean(data)
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

export async function updateRequestStatus(id: string, status: 'submitted' | 'in_progress' | 'done') {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await isAdmin(user.id))) {
    return { error: 'Not authorized.' }
  }

  const admin = createAdminSupabase()
  const { error } = await admin
    .from('maintenance_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'Could not update status.' }
  return {}
}
