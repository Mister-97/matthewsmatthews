'use client'

import { useEffect, useState } from 'react'
import { getAllRequests, type AdminMaintenanceRequest } from './actions'
import AdminRequestRow from './AdminRequestRow'

export default function RequestsTab() {
  const [requests, setRequests] = useState<AdminMaintenanceRequest[] | null>(null)

  useEffect(() => {
    getAllRequests().then(setRequests)
  }, [])

  if (requests === null) {
    return <p style={{ color: '#888' }}>Loading…</p>
  }

  if (requests.length === 0) {
    return <p style={{ color: '#888' }}>No requests.</p>
  }

  return (
    <div>
      {requests.map((r) => (
        <AdminRequestRow
          key={r.id}
          id={r.id}
          tenantName={r.tenantName}
          tenantUnit={r.tenantUnit}
          description={r.description}
          urgency={r.urgency}
          status={r.status}
          photoUrl={r.photoUrl}
          createdAt={r.createdAt}
        />
      ))}
    </div>
  )
}
