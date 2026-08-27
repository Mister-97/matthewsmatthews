'use client'

import { useEffect, useState } from 'react'
import { getAdminOverview, type AdminOverview } from './actions'

export default function OverviewTab() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)

  useEffect(() => {
    getAdminOverview().then(setOverview)
  }, [])

  const cards = [
    { label: 'Open Requests', value: overview?.openRequests },
    { label: 'Total Tenants', value: overview?.totalTenants },
    { label: 'Total Messages', value: overview?.totalMessages },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {cards.map((c) => (
          <div key={c.label} style={{ border: '1px solid #ede8de', borderRadius: '10px', padding: '1.2rem', textAlign: 'center' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 700, color: '#c9942a', display: 'block' }}>
              {c.value ?? '…'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
