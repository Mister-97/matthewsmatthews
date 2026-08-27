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
