import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { AccountRole, RecruiterProfile, TalentProfile } from '@/lib/supabase/types'

// Satu kali per request (Navbar + halaman memanggil yang sama).
export const getViewer = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, role: null, isAdmin: false } as const

  const { data: adminRow } = await supabase
    .from('portora_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const role = (user.user_metadata?.role as AccountRole | undefined) ?? null
  return { supabase, user, role, isAdmin: !!adminRow } as const
})

export const getOwnTalentProfile = cache(async () => {
  const { supabase, user } = await getViewer()
  if (!user) return null
  const { data } = await supabase
    .from('portora_talent_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
  return (data?.[0] as TalentProfile | undefined) ?? null
})

export const getOwnRecruiterProfile = cache(async () => {
  const { supabase, user } = await getViewer()
  if (!user) return null
  const { data } = await supabase
    .from('portora_recruiter_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  return (data as RecruiterProfile | null) ?? null
})
