'use client'

import { useState } from 'react'
import { updateRequestStatus } from './actions'

type Props = {
  id: string
  tenantName: string
  tenantUnit: string
  description: string
  urgency: string
  status: 'submitted' | 'in_progress' | 'done'
  photoUrl: string | null
  createdAt: string
}

export default function AdminRequestRow({ id, tenantName, tenantUnit, description, urgency, status, photoUrl, createdAt }: Props) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [updating, setUpdating] = useState(false)

  async function handleChange(newStatus: 'submitted' | 'in_progress' | 'done') {
    const previous = currentStatus
    setCurrentStatus(newStatus)
    setUpdating(true)
    const result = await updateRequestStatus(id, newStatus)
    setUpdating(false)
    if (result?.error) {
      setCurrentStatus(previous)
    }
  }

  return (
    <div style={{ border: '1px solid #ede8de', borderRadius: '8px', padding: '1.2rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <strong style={{ wordBreak: 'break-word' }}>{tenantName} — {tenantUnit}</strong>
        <span style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap' }}>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{description}</p>
      <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', textTransform: 'capitalize' }}>Urgency: {urgency}</p>
      {photoUrl && (
        <a href={photoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#c9942a', display: 'block', marginBottom: '0.5rem' }}>
          View photo
        </a>
      )}
      <select
        value={currentStatus}
        disabled={updating}
        onChange={(e) => handleChange(e.target.value as 'submitted' | 'in_progress' | 'done')}
        style={{ padding: '0.4rem 0.6rem', border: '1px solid #ede8de', borderRadius: '6px' }}
      >
        <option value="submitted">Submitted</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
  )
}
