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
