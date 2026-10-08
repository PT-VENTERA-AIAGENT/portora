'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteAccount } from '@/app/actions/account'
import PasswordForm from '@/components/portora/PasswordForm'

export function ChangePassword() {
  return <PasswordForm submitLabel="Ganti password" onDone={() => toast.success('Password berhasil diganti')} />
}

export function DeleteAccount({ what }: { what: string }) {
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function onDelete() {
    setError('')
    startTransition(async () => {
      const result = await deleteAccount(confirm)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: '#6B7280' }}>
        Menghapus akun akan menghapus permanen {what}. Tindakan ini tidak bisa dibatalkan.
      </p>
      {error && <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>}
      <label className="block text-xs font-medium" style={{ color: '#0A0E1A' }}>
        Ketik <span className="font-mono">HAPUS</span> untuk konfirmasi
        <input value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1.5 w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-navy" style={{ borderColor: '#E5E7EB' }} />
      </label>
      <button onClick={onDelete} disabled={pending || confirm.trim().toUpperCase() !== 'HAPUS'}
        className="border px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-40" style={{ borderColor: '#DC2626', color: '#DC2626' }}>
        {pending ? 'Menghapus…' : 'Hapus akun permanen'}
      </button>
    </div>
  )
}
