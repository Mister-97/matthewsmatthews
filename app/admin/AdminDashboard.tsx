'use client'

import { useState } from 'react'
import OverviewTab from './OverviewTab'
import RequestsTab from './RequestsTab'
import MessagesTab from './MessagesTab'
import TenantsTab from './TenantsTab'
import { adminSignOut } from './actions'

type Tab = 'overview' | 'requests' | 'messages' | 'tenants'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'requests', label: 'Requests' },
  { id: 'messages', label: 'Messages' },
  { id: 'tenants', label: 'Tenants' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.5rem, 5vw, 3rem) 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.5rem, 5vw, 2rem)', margin: 0 }}>Team Dashboard</h1>
        <form action={adminSignOut}>
          <button type="submit" style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#888', fontSize: '0.85rem' }}>
            Sign out
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #ede8de', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.8rem 1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              borderBottom: tab === t.id ? '2px solid #c9942a' : '2px solid transparent',
              color: tab === t.id ? '#c9942a' : '#888',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'requests' && <RequestsTab />}
      {tab === 'messages' && <MessagesTab />}
      {tab === 'tenants' && <TenantsTab />}
    </main>
  )
}
