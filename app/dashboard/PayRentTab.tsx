'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

const ZELLE_CONTACT = '330-719-6908'

export default function PayRentTab() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(ZELLE_CONTACT, { width: 240, margin: 2, color: { dark: '#3a3a3a', light: '#ffffff' } }).then(setQrDataUrl)
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', marginBottom: '0.5rem', color: '#3a3a3a' }}>Pay Rent via Zelle</h2>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>
        Scan this code in your banking app&apos;s Zelle payment screen, or send to <strong>{ZELLE_CONTACT}</strong> directly.
      </p>
      {qrDataUrl && (
        <img src={qrDataUrl} alt="Zelle QR code" style={{ border: '1px solid #ede8de', borderRadius: '12px', padding: '1rem' }} />
      )}
      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1.5rem' }}>
        Matthews &amp; Matthews Property Investment &amp; Management
      </p>
      <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.5rem', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
        Please include your name and unit address in the Zelle memo so we can match your payment.
      </p>
    </div>
  )
}
