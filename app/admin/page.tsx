import { cookies } from 'next/headers'
import { createAdminSupabase } from '@/lib/supabase/admin'
import AdminLoginForm from './login-form'
import AdminRequestRow from './AdminRequestRow'
import { adminSignOut } from './actions'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const adminPassword = process.env.ADMIN_PASSWORD
  const cookie = cookieStore.get('admin_session')?.value
  const isAuthed = Boolean(adminPassword) && Boolean(cookie) && cookie === adminPassword

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', margin: 0 }}>Maintenance Requests</h1>
        <form action={adminSignOut}>
          <button type="submit" style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#888', fontSize: '0.85rem' }}>
            Sign out
          </button>
        </form>
      </div>
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
