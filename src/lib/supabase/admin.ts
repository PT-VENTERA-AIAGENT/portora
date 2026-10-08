import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Service role: melewati RLS. Hanya untuk operasi server yang sudah divalidasi
// (hapus akun, mencari email penerima notifikasi). Jangan pernah dikirim ke client.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
