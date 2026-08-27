'use client'

import { useEffect, useState } from 'react'
import { getAllMessageThreads, replyToMessage, type AdminMessageThread } from './actions'

function ThreadCard({ thread, onReplied }: { thread: AdminMessageThread; onReplied: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const last = thread.messages[thread.messages.length - 1]

  async function handleReply() {
    setError(null)
    if (!reply.trim()) return
    setSending(true)
    const result = await replyToMessage(thread.tenantId, reply)
    setSending(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setReply('')
    onReplied()
  }

  return (
    <div style={{ border: '1px solid #ede8de', borderRadius: '8px', padding: '1.2rem', marginBottom: '1rem' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <strong style={{ wordBreak: 'break-word' }}>{thread.tenantName} — {thread.tenantUnit}</strong>
          <span style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap' }}>{new Date(last.created_at).toLocaleString()}</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#555', margin: 0 }}>
          {last.sender === 'admin' ? 'You: ' : ''}{last.body.slice(0, 100)}{last.body.length > 100 ? '…' : ''}
        </p>
      </button>

      {expanded && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #ede8de', paddingTop: '1rem' }}>
          {thread.messages.map((m) => (
            <div key={m.id} style={{ marginBottom: '0.6rem', display: 'flex', justifyContent: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '80%',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  background: m.sender === 'admin' ? '#c9942a' : '#f5f0e6',
                  color: m.sender === 'admin' ? '#fff' : '#3a3a3a',
                }}
              >
                <p style={{ margin: 0 }}>{m.body}</p>
                <span style={{ fontSize: '0.65rem', opacity: 0.75, display: 'block', marginTop: '0.3rem' }}>
                  {m.sender === 'admin' ? 'You' : thread.tenantName} · {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Type a reply…"
            style={{ width: '100%', padding: '0.7rem', marginTop: '0.5rem', marginBottom: '0.6rem', border: '1px solid #ede8de', borderRadius: '6px', fontFamily: 'inherit' }}
          />
          {error && <p style={{ color: '#b3261e', fontSize: '0.8rem', marginBottom: '0.6rem' }}>{error}</p>}
          <button
            onClick={handleReply}
            disabled={sending}
            style={{ padding: '0.6rem 1.2rem', background: '#c9942a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            {sending ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function MessagesTab() {
  const [threads, setThreads] = useState<AdminMessageThread[] | null>(null)

  function load() {
    getAllMessageThreads().then(setThreads)
  }

  useEffect(() => {
    load()
  }, [])

  if (threads === null) {
    return <p style={{ color: '#888' }}>Loading…</p>
  }

  if (threads.length === 0) {
    return <p style={{ color: '#888' }}>No messages yet.</p>
  }

  return (
    <div>
      {threads.map((t) => (
        <ThreadCard key={t.tenantId} thread={t} onReplied={load} />
      ))}
    </div>
  )
}
