'use client'

import { useState } from 'react'
import MaintenanceTab from './MaintenanceTab'
import PayRentTab from './PayRentTab'
import MessageTab from './MessageTab'
import { signOut } from './actions'

export default function DashboardPage() {
  const [tab, setTab] = useState<'maintenance' | 'rent' | 'message'>('maintenance')

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 3rem) 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: 0, color: '#3a3a3a' }}>Tenant Dashboard</h1>
        <form action={signOut}>
          <button type="submit" style={{ background: 'none', border: '1px solid #ede8de', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#888', fontSize: '0.85rem' }}>
            Sign out
          </button>
        </form>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #ede8de', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setTab('maintenance')}
          style={{ padding: '0.8rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, borderBottom: tab === 'maintenance' ? '2px solid #c9942a' : '2px solid transparent', color: tab === 'maintenance' ? '#c9942a' : '#888' }}
        >
          Maintenance
        </button>
        <button
          onClick={() => setTab('rent')}
          style={{ padding: '0.8rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, borderBottom: tab === 'rent' ? '2px solid #c9942a' : '2px solid transparent', color: tab === 'rent' ? '#c9942a' : '#888' }}
        >
          Pay Rent
        </button>
        <button
          onClick={() => setTab('message')}
          style={{ padding: '0.8rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, borderBottom: tab === 'message' ? '2px solid #c9942a' : '2px solid transparent', color: tab === 'message' ? '#c9942a' : '#888' }}
        >
          Message Team
        </button>
      </div>
      {tab === 'maintenance' && <MaintenanceTab />}
      {tab === 'rent' && <PayRentTab />}
      {tab === 'message' && <MessageTab />}
    </main>
  )
}
