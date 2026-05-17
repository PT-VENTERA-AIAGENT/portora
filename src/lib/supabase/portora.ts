import { createClient } from './client'
import type { TalentProfile, RecruiterLead } from './types'

export async function getTalents(filters?: {
  role?: string
  location?: string
  available?: boolean
  search?: string
  limit?: number
}) {
  const supabase = createClient()
  let query = supabase
    .from('portora_talent_profiles')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (filters?.role) query = query.eq('role', filters.role)
  if (filters?.available) query = query.eq('available', true)
  if (filters?.location) query = query.ilike('location', `%${filters.location}%`)
  if (filters?.search) query = query.or(`full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  return { data: data as TalentProfile[] | null, error }
}

export async function getTalentByUsername(username: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('portora_talent_profiles')
    .select('*')
    .eq('username', username)
    .eq('is_public', true)
    .single()
  return { data: data as TalentProfile | null, error }
}

export async function createTalentProfile(profile: Omit<TalentProfile, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('portora_talent_profiles')
    .insert(profile)
    .select()
    .single()
  return { data, error }
}

export async function submitRecruiterLead(lead: RecruiterLead) {
  const supabase = createClient()
  const { error } = await supabase
    .from('portora_recruiter_leads')
    .insert({ ...lead, source: 'portora-for-recruiters' })
  return { error }
}

export async function toggleShortlist(talentProfileId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Not authenticated') }

  const { data: existing } = await supabase
    .from('portora_shortlists')
    .select('id')
    .eq('recruiter_user_id', user.id)
    .eq('talent_profile_id', talentProfileId)
    .single()

  if (existing) {
    const { error } = await supabase.from('portora_shortlists').delete().eq('id', existing.id)
    return { saved: false, error }
  } else {
    const { error } = await supabase.from('portora_shortlists').insert({
      recruiter_user_id: user.id,
      talent_profile_id: talentProfileId,
    })
    return { saved: true, error }
  }
}
