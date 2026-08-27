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
