'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { homePathFor } from '@/lib/portora/format'
import AuthShell from '@/components/portora/AuthShell'
import PasswordForm from '@/components/portora/PasswordForm'

// Dibuka dari link email reset (lewat /auth/callback yang sudah membuat sesi).
export default function ResetPasswordPage() {
  const router = useRouter()
  const [done, setDone] = useState(false)

  async function goHome() {
    const { data: { user } } = await createClient().auth.getUser()
    router.push(homePathFor(user?.user_metadata?.role))
    router.refresh()
  }

  return (
    <AuthShell title="Buat password baru" subtitle="Gunakan password yang belum pernah kamu pakai">
      {done ? (
        <div className="text-center py-2 space-y-4">
          <p className="text-sm" style={{ color: '#0A0E1A' }}>Password berhasil diganti.</p>
          <button onClick={goHome} className="w-full text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>Lanjut</button>
        </div>
      ) : (
        <PasswordForm submitLabel="Simpan password" onDone={() => setDone(true)} />
      )}
      {!done && (
        <p className="text-xs text-center mt-4" style={{ color: '#6B7280' }}>
          Link kedaluwarsa? <Link href="/forgot-password" className="hover:underline" style={{ color: '#1A365D' }}>Kirim ulang</Link>
        </p>
      )}
    </AuthShell>
  )
}
