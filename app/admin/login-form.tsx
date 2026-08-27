'use client'

import { useState } from 'react'
import { adminSignIn } from './actions'

export default function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await adminSignIn(formData)
    if (result?.error) {
      setError(result.error)
      return
    }
    window.location.reload()
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <form action={handleSubmit} style={{ background: '#fff', padding: 'clamp(1.5rem, 6vw, 2.5rem)', borderRadius: '12px', width: '100%', maxWidth: '320px', border: '1px solid #ede8de' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Admin</h1>
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Email</label>
        <input name="email" type="email" required style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Password</label>
        <input name="password" type="password" required style={{ width: '100%', padding: '0.6rem', marginBottom: '1.5rem', border: '1px solid #ede8de', borderRadius: '6px' }} />
        {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.8rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          Log In
        </button>
      </form>
    </main>
  )
}
