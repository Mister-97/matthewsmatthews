'use client'

import { useState } from 'react'
import MaintenanceTab from './MaintenanceTab'
import PayRentTab from './PayRentTab'

export default function DashboardPage() {
  const [tab, setTab] = useState<'maintenance' | 'rent'>('maintenance')

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: '1.5rem', color: '#3a3a3a' }}>Tenant Dashboard</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #ede8de' }}>
        <button
          onClick={() => setTab('maintenance')}
          style={{ padding: '0.8rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, borderBottom: tab === 'maintenance' ? '2px solid #c9942a' : '2px solid transparent', color: tab === 'maintenance' ? '#c9942a' : '#888' }}
        >
          Maintenance
        </button>
        <button
          onClick={() => setTab('rent')}
          style={{ padding: '0.8rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, borderBottom: tab === 'rent' ? '2px solid #c9942a' : '2px solid transparent', color: tab === 'rent' ? '#c9942a' : '#888' }}
        >
          Pay Rent
        </button>
      </div>
      {tab === 'maintenance' ? <MaintenanceTab /> : <PayRentTab />}
    </main>
  )
}
