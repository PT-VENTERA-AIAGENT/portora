'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { authErrorMessage } from '@/lib/portora/auth-errors'
import { authInputClass, authInputStyle } from './AuthShell'

// Dipakai /reset-password (dari email) dan halaman Akun (ganti password).
export default function PasswordForm({ submitLabel, onDone }: { submitLabel: string; onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return }
    if (password !== confirm) { setError('Konfirmasi password tidak sama.'); return }
    setLoading(true)
    const { error: authError } = await createClient().auth.updateUser({ password })
    setLoading(false)
    if (authError) { setError(authErrorMessage(authError.message)); return }
    setPassword('')
    setConfirm('')
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0E1A' }}>Password baru</label>
        <input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 karakter" className={authInputClass} style={authInputStyle} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0E1A' }}>Ulangi password baru</label>
        <input type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} className={authInputClass} style={authInputStyle} />
      </div>
      <button type="submit" disabled={loading} className="w-full text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: '#1A365D' }}>
        {loading ? 'Menyimpan…' : submitLabel}
      </button>
    </form>
  )
}
