'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { notifyInviteAccepted } from '@/lib/portora/email'
import { getOwnTalentProfile, getViewer } from '@/lib/portora/session'
import { slugify } from '@/lib/portora/format'
import { BUCKETS } from '@/lib/portora/constants'
import {
  firstIssue,
  portfolioItemSchema,
  talentProfileSchema,
  type PortfolioItemInput,
  type TalentProfileInput,
} from '@/lib/portora/validation'
import type { InviteStatus } from '@/lib/supabase/types'

type Result<T = object> = ({ error: string } & Partial<T>) | ({ error?: undefined } & T)

async function requireTalent() {
  const viewer = await getViewer()
  if (!viewer.user) return { error: 'Sesi berakhir. Silakan login lagi.' }
  if (viewer.role !== 'talent') return { error: 'Hanya akun talent yang bisa melakukan ini.' }
  return { ...viewer, error: null, user: viewer.user }
}

function revalidateTalent(username?: string) {
  revalidatePath('/dashboard')
  revalidatePath('/discover')
  if (username) revalidatePath(`/talent/${username}`)
}

export async function saveTalentProfile(
  input: TalentProfileInput,
  newItems: PortfolioItemInput[] = [],
): Promise<Result<{ username: string; created: boolean }>> {
  const ctx = await requireTalent()
  if (ctx.error !== null) return { error: ctx.error }
  const { supabase, user } = ctx

  const parsed = talentProfileSchema.safeParse(input)
  if (!parsed.success) return { error: firstIssue(parsed.error) }
  const items = []
  for (const raw of newItems) {
    const item = portfolioItemSchema.safeParse(raw)
    if (!item.success) return { error: firstIssue(item.error) }
    items.push(item.data)
  }
  const { whatsapp, contact_email, ...fields } = parsed.data

  const existing = await getOwnTalentProfile()
  let profileId: string
  let username: string

  if (existing) {
    const { error } = await supabase.from('portora_talent_profiles').update(fields).eq('id', existing.id)
    if (error) return { error: error.message }
    profileId = existing.id
    username = existing.username
  } else {
    if (fields.portfolio_links.length + items.length === 0) {
      return { error: 'Tambahkan minimal 1 karya atau link portfolio.' }
    }
    // Username unik; profil orang lain yang belum disetujui tidak terlihat, jadi andalkan unique constraint.
    const base = slugify(fields.full_name)
    let created: { id: string; username: string } | null = null
    for (let attempt = 0; attempt < 4 && !created; attempt++) {
      const candidate = attempt === 0 ? base : `${base}-${Math.floor(Math.random() * 9000 + 1000)}`
      const { data, error } = await supabase
        .from('portora_talent_profiles')
        .insert({ ...fields, user_id: user.id, username: candidate, is_public: true })
        .select('id, username')
        .single()
      if (!error) created = data
      else if (error.code !== '23505') return { error: error.message }
    }
    if (!created) return { error: 'Gagal membuat username unik. Coba lagi.' }
    profileId = created.id
    username = created.username
  }

  const { error: contactError } = await supabase
    .from('portora_talent_contacts')
    .upsert({ talent_profile_id: profileId, whatsapp, email: contact_email ?? user.email ?? null }, { onConflict: 'talent_profile_id' })
  if (contactError) return { error: contactError.message }

  if (items.length) {
    const { error } = await supabase
      .from('portora_portfolio_items')
      .insert(items.map((item, i) => ({ ...item, talent_profile_id: profileId, sort_order: i })))
    if (error) return { error: error.message }
  }

  revalidateTalent(username)
  return { username, created: !existing }
}

export async function addPortfolioItem(input: PortfolioItemInput): Promise<Result> {
  const ctx = await requireTalent()
  if (ctx.error !== null) return { error: ctx.error }
  const profile = await getOwnTalentProfile()
  if (!profile) return { error: 'Lengkapi profil dulu.' }

  const parsed = portfolioItemSchema.safeParse(input)
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const { count } = await ctx.supabase
    .from('portora_portfolio_items')
    .select('id', { count: 'exact', head: true })
    .eq('talent_profile_id', profile.id)
  if ((count ?? 0) >= 24) return { error: 'Maksimal 24 karya. Hapus karya lama dulu.' }

  const { error } = await ctx.supabase
    .from('portora_portfolio_items')
    .insert({ ...parsed.data, talent_profile_id: profile.id, sort_order: count ?? 0 })
  if (error) return { error: error.message }
  revalidateTalent(profile.username)
  return {}
}

export async function deletePortfolioItem(itemId: string): Promise<Result> {
  const ctx = await requireTalent()
  if (ctx.error !== null) return { error: ctx.error }
  const profile = await getOwnTalentProfile()
  if (!profile) return { error: 'Profil tidak ditemukan.' }

  const { data: item } = await ctx.supabase
    .from('portora_portfolio_items')
    .select('id, media_url')
    .eq('id', itemId)
    .eq('talent_profile_id', profile.id)
    .maybeSingle()
  if (!item) return { error: 'Karya tidak ditemukan.' }

  const { error } = await ctx.supabase.from('portora_portfolio_items').delete().eq('id', itemId)
  if (error) return { error: error.message }

  // File di bucket portfolio milik user ikut dihapus.
  const marker = `/object/public/${BUCKETS.portfolio}/`
  const path = item.media_url?.split(marker)[1]
  if (path?.startsWith(`${ctx.user.id}/`)) {
    await ctx.supabase.storage.from(BUCKETS.portfolio).remove([decodeURIComponent(path)])
  }

  revalidateTalent(profile.username)
  return {}
}

export async function setAvailability(available: boolean): Promise<Result> {
  const ctx = await requireTalent()
  if (ctx.error !== null) return { error: ctx.error }
  const profile = await getOwnTalentProfile()
  if (!profile) return { error: 'Profil tidak ditemukan.' }

  const { error } = await ctx.supabase.from('portora_talent_profiles').update({ available }).eq('id', profile.id)
  if (error) return { error: error.message }
  revalidateTalent(profile.username)
  return {}
}

export async function setVisibility(isPublic: boolean): Promise<Result> {
  const ctx = await requireTalent()
  if (ctx.error !== null) return { error: ctx.error }
  const profile = await getOwnTalentProfile()
  if (!profile) return { error: 'Profil tidak ditemukan.' }

  const { error } = await ctx.supabase.from('portora_talent_profiles').update({ is_public: isPublic }).eq('id', profile.id)
  if (error) return { error: error.message }
  revalidateTalent(profile.username)
  return {}
}

export async function respondInvite(inviteId: string, status: Exclude<InviteStatus, 'sent'>): Promise<Result> {
  if (status !== 'accepted' && status !== 'declined') return { error: 'Status tidak dikenal.' }
  const ctx = await requireTalent()
  if (ctx.error !== null) return { error: ctx.error }
  const profile = await getOwnTalentProfile()
  if (!profile) return { error: 'Profil tidak ditemukan.' }

  const { data: invite } = await ctx.supabase
    .from('portora_invites')
    .select('id, status, recruiter_user_id, project_title')
    .eq('id', inviteId)
    .eq('talent_profile_id', profile.id)
    .maybeSingle()
  if (!invite) return { error: 'Undangan tidak ditemukan.' }
  if (invite.status !== 'sent') return { error: 'Undangan ini sudah dijawab.' }

  const { error } = await ctx.supabase
    .from('portora_invites')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', inviteId)
  if (error) return { error: error.message }

  if (status === 'accepted') {
    after(() => notifyInviteAccepted(invite.recruiter_user_id, profile.full_name, profile.username, invite.project_title))
  }
  revalidatePath('/dashboard')
  revalidatePath('/invites')
  return {}
}
