import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: tenant } = await supabase.from('tenants').select('id').eq('id', user.id).single()
  if (!tenant) {
    redirect('/login')
  }

  return <>{children}</>
}
