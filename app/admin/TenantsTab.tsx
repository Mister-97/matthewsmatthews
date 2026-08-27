'use client'

import { useEffect, useState } from 'react'
import { getAllTenants, createTenant, type AdminTenant } from './actions'

export default function TenantsTab() {
  const [tenants, setTenants] = useState<AdminTenant[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function load() {
    getAllTenants().then(setTenants)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    setSubmitting(true)
    const result = await createTenant(formData)
    setSubmitting(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setSuccess(true)
    load()
    ;(document.getElementById('add-tenant-form') as HTMLFormElement)?.reset()
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '1rem', color: '#3a3a3a' }}>Add a Tenant</h2>
      <form id="add-tenant-form" action={handleSubmit} style={{ border: '1px solid #ede8de', borderRadius: '8px', padding: '1.2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Name</label>
            <input name="name" required style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Unit</label>
            <input name="unit" required placeholder="123 Main St Apt 2" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Email</label>
            <input name="email" type="email" required style={{ width: '100%', padding: '0.6rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
          </div>
        </div>
        {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
        {success && <p style={{ color: '#2e7d32', fontSize: '0.8rem', marginBottom: '1rem' }}>Invite sent — the tenant will get an email to set their password.</p>}
        <button type="submit" disabled={submitting} style={{ padding: '0.7rem 1.4rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          {submitting ? 'Sending Invite…' : 'Add Tenant & Send Invite'}
        </button>
      </form>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '1rem', color: '#3a3a3a' }}>All Tenants</h2>
      {tenants === null && <p style={{ color: '#888' }}>Loading…</p>}
      {tenants !== null && tenants.length === 0 && <p style={{ color: '#888' }}>No tenants yet.</p>}
      {tenants?.map((t) => (
        <div key={t.id} style={{ border: '1px solid #ede8de', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>{t.name}</strong>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: '0.2rem 0 0' }}>{t.unit}</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>{t.email}</span>
        </div>
      ))}
    </div>
  )
}
