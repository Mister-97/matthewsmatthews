'use client'

import { useEffect, useState } from 'react'
import { sendTeamMessage, getMyMessages, type Message } from './actions'

export default function MessageTab() {
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function loadMessages() {
    setMessages(await getMyMessages())
  }

  useEffect(() => {
    loadMessages()
  }, [])

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSending(true)
    const result = await sendTeamMessage(formData)
    setSending(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    await loadMessages()
    ;(document.getElementById('message-form') as HTMLFormElement)?.reset()
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '0.5rem', color: '#3a3a3a' }}>Message the Team</h2>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>
        Send a note directly to our team. We&apos;ll reply here and by email.
      </p>

      {messages.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                marginBottom: '0.6rem',
                display: 'flex',
                justifyContent: m.sender === 'tenant' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  background: m.sender === 'tenant' ? '#c9942a' : '#f5f0e6',
                  color: m.sender === 'tenant' ? '#fff' : '#3a3a3a',
                }}
              >
                <p style={{ margin: 0 }}>{m.body}</p>
                <span style={{ fontSize: '0.65rem', opacity: 0.75, display: 'block', marginTop: '0.3rem' }}>
                  {m.sender === 'tenant' ? 'You' : 'Team'} · {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <form id="message-form" action={handleSubmit}>
        <textarea name="message" required rows={4} placeholder="What's on your mind?" style={{ width: '100%', padding: '0.7rem', marginBottom: '1rem', border: '1px solid #ede8de', borderRadius: '6px', fontFamily: 'inherit' }} />
        {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" disabled={sending} style={{ padding: '0.8rem 1.5rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          {sending ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
