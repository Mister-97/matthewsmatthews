'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminSupabase } from '@/lib/supabase/admin'

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword || password !== adminPassword) {
    return { error: 'Incorrect password.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', adminPassword, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return {}
}

export async function adminSignOut() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin')
}

export async function updateRequestStatus(id: string, status: 'submitted' | 'in_progress' | 'done') {
  const cookieStore = await cookies()
  const adminPassword = process.env.ADMIN_PASSWORD
  const cookie = cookieStore.get('admin_session')?.value
  if (!adminPassword || !cookie || cookie !== adminPassword) {
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
