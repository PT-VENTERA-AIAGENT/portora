'use client'

import { createClient } from '@/lib/supabase/client'
import { BUCKETS } from './constants'

const LIMITS = {
  avatars: { maxBytes: 2 * 1024 * 1024, types: ['image/png', 'image/jpeg', 'image/webp'] },
  portfolio: { maxBytes: 5 * 1024 * 1024, types: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] },
} as const

// Upload ke folder <user id>/ (sesuai policy storage), kembalikan URL publik.
export async function uploadImage(kind: keyof typeof BUCKETS, file: File): Promise<{ url: string } | { error: string }> {
  const limit = LIMITS[kind]
  if (!(limit.types as readonly string[]).includes(file.type)) return { error: 'Format harus PNG, JPG, atau WebP.' }
  if (file.size > limit.maxBytes) return { error: `Ukuran maksimal ${limit.maxBytes / 1024 / 1024} MB.` }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi berakhir. Silakan login lagi.' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`
  const bucket = BUCKETS[kind]
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false })
  if (error) return { error: error.message }
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl }
}
