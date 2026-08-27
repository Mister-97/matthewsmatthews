import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import AdminLoginForm from './login-form'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const serverSupabase = await createServerSupabase()
  const { data: { user } } = await serverSupabase.auth.getUser()

  const isAuthed = user
    ? Boolean((await createAdminSupabase().from('admins').select('id').eq('id', user.id).single()).data)
    : false

  if (!isAuthed) {
    return <AdminLoginForm />
  }

  return <AdminDashboard />
}
