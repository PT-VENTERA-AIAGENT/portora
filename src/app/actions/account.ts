'use server'

import { redirect } from 'next/navigation'
import { getViewer } from '@/lib/portora/session'
import { homePathFor } from '@/lib/portora/format'
import { BUCKETS } from '@/lib/portora/constants'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AccountRole } from '@/lib/supabase/types'

// Dipakai akun yang belum punya role (mis. daftar lewat Google).
export async function chooseRole(role: AccountRole): Promise<{ error: string } | void> {
  if (role !== 'talent' && role !== 'recruiter') return { error: 'Role tidak dikenal.' }
  const { supabase, user, role: current } = await getViewer()
  if (!user) redirect('/login')
  if (current) redirect(homePathFor(current))

  const { error } = await supabase.auth.updateUser({ data: { role } })
  if (error) return { error: error.message }
  redirect(role === 'talent' ? '/onboarding' : '/company')
}

// Hapus akun + semua data (FK on delete cascade dari auth.users) + file di storage.
export async function deleteAccount(confirmText: string): Promise<{ error: string } | void> {
  if (confirmText.trim().toUpperCase() !== 'HAPUS') return { error: 'Ketik HAPUS untuk konfirmasi.' }
  const { supabase, user } = await getViewer()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  if (!admin) return { error: 'Penghapusan akun belum dikonfigurasi di server. Hubungi tim Portora.' }

  for (const bucket of Object.values(BUCKETS)) {
    const { data: files } = await admin.storage.from(bucket).list(user.id, { limit: 1000 })
    if (files?.length) await admin.storage.from(bucket).remove(files.map(f => `${user.id}/${f.name}`))
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  await supabase.auth.signOut()
  redirect('/?akun=dihapus')
}
