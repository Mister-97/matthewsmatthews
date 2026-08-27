'use client'

import { useState } from 'react'
import { sendTeamMessage } from './actions'

export default function MessageTab() {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSent(false)
    setSending(true)
    const result = await sendTeamMessage(formData)
    setSending(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setSent(true)
    ;(document.getElementById('message-form') as HTMLFormElement)?.reset()
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '0.5rem', color: '#3a3a3a' }}>Message the Team</h2>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>
        Send a note directly to our team. We&apos;ll reply to the email on your account.
      </p>
      <form id="message-form" action={handleSubmit}>
        <textarea name="message" required rows={6} placeholder="What's on your mind?" style={{ width: '100%', padding: '0.7rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px', fontFamily: 'inherit' }} />
        {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
        {sent && <p style={{ color: '#2e7d32', fontSize: '0.8rem', marginBottom: '1rem' }}>Message sent — thanks!</p>}
        <button type="submit" disabled={sending} style={{ padding: '0.8rem 1.5rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          {sending ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
