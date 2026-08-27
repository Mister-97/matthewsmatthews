'use client'

import { useState } from 'react'
import { signIn } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await signIn(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #faf8f5)' }}>
      <form action={handleSubmit} style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '360px', border: '1px solid #ede8de' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src="https://i.ibb.co/0yhg1SMc/matthews-property-logo.png" alt="Matthews & Matthews Property Investment & Management" style={{ height: '72px' }} />
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', marginBottom: '1.5rem', color: '#3a3a3a', textAlign: 'center' }}>Tenant Login</h1>
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Email</label>
        <input name="email" type="email" required style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Password</label>
        <input name="password" type="password" required style={{ width: '100%', padding: '0.6rem', marginBottom: '1.5rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
        {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.8rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          Log In
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#888', marginTop: '1.5rem' }}>
          Are you a team member? <a href="/admin" style={{ color: '#c9942a', textDecoration: 'none', fontWeight: 600 }}>Sign in here</a>
        </p>
      </form>
    </main>
  )
}
