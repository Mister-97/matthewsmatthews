'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createBrowserSupabase()
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session))
      setChecking(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const supabase = createBrowserSupabase()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (updateError) {
      setError('Could not set your password. Please try again.')
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #faf8f5)', padding: '1.5rem' }}>
      <div style={{ background: '#fff', padding: 'clamp(1.5rem, 6vw, 2.5rem)', borderRadius: '12px', width: '100%', maxWidth: '360px', border: '1px solid #ede8de' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src="https://i.ibb.co/0yhg1SMc/matthews-property-logo.png" alt="Matthews & Matthews Property Investment & Management" style={{ height: '72px' }} />
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', marginBottom: '1.5rem', color: '#3a3a3a', textAlign: 'center' }}>Set Your Password</h1>

        {checking && <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>Checking your invite link…</p>}

        {!checking && !ready && (
          <p style={{ fontSize: '0.85rem', color: '#b3261e', textAlign: 'center' }}>
            This invite link is invalid or has expired. Please ask Matthews &amp; Matthews for a new one.
          </p>
        )}

        {!checking && ready && (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px' }}
            />
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1.5rem', border: '1px solid #ede8de', borderRadius: '6px' }}
            />
            {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '0.8rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              {submitting ? 'Saving…' : 'Set Password & Continue'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
