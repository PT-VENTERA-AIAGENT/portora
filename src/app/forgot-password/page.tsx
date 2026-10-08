'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { authErrorMessage } from '@/lib/portora/auth-errors'
import AuthShell, { authInputClass, authInputStyle } from '@/components/portora/AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    if (authError) { setError(authErrorMessage(authError.message)); return }
    setSent(true)
  }

  return (
    <AuthShell
      title="Lupa password"
      subtitle="Kami kirim link untuk membuat password baru"
      footer={<>Ingat password? <Link href="/login" className="font-medium hover:underline" style={{ color: '#1A365D' }}>Login</Link></>}
    >
      {sent ? (
        <p className="text-sm text-center py-4" style={{ color: '#0A0E1A' }}>
          Jika <span className="font-medium">{email}</span> terdaftar, link reset password sudah dikirim. Cek inbox dan folder spam.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0E1A' }}>Email akun</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="kamu@email.com" className={authInputClass} style={authInputStyle} />
          </div>
          <button type="submit" disabled={loading} className="w-full text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: '#1A365D' }}>
            {loading ? 'Mengirim…' : 'Kirim link reset'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
