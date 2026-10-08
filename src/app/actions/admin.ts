'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { notifyModeration } from '@/lib/portora/email'
import { notFound } from 'next/navigation'
import { getViewer } from '@/lib/portora/session'
import { generateTalentSummary } from '@/lib/portora/ai-summary'
import type { PlanId, PortfolioItem, TalentProfile } from '@/lib/supabase/types'

async function requireAdmin() {
  const viewer = await getViewer()
  if (!viewer.user || !viewer.isAdmin) notFound()
  return { ...viewer, user: viewer.user }
}

type Ctx = Awaited<ReturnType<typeof requireAdmin>>

async function refreshSummary(ctx: Ctx, talentId: string) {
  const { data: profile } = await ctx.supabase.from('portora_talent_profiles').select('*').eq('id', talentId).maybeSingle()
  if (!profile) return false
  const { data: items } = await ctx.supabase
    .from('portora_portfolio_items')
    .select('*')
    .eq('talent_profile_id', talentId)
    .order('sort_order', { ascending: true })
  const summary = await generateTalentSummary(profile as TalentProfile, (items ?? []) as PortfolioItem[])
  if (!summary) return false
  await ctx.supabase
    .from('portora_talent_profiles')
    .update({ ai_summary: summary, ai_summary_at: new Date().toISOString() })
    .eq('id', talentId)
  await ctx.supabase.from('portora_moderation_logs').insert({ admin_user_id: ctx.user.id, talent_profile_id: talentId, action: 'ai_summary' })
  return true
}

function revalidateAdmin(username?: string) {
  revalidatePath('/admin')
  revalidatePath('/discover')
  revalidatePath('/dashboard')
  if (username) revalidatePath(`/talent/${username}`)
}

export async function moderateTalent(formData: FormData) {
  const ctx = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const action = String(formData.get('op') ?? '')
  const reason = String(formData.get('reason') ?? '').trim().slice(0, 500) || null

  const updates: Record<string, unknown> = {}
  if (action === 'approve') Object.assign(updates, { status: 'approved', rejection_reason: null })
  else if (action === 'reject') Object.assign(updates, { status: 'rejected', rejection_reason: reason ?? 'Profil belum memenuhi standar kurasi.' })
  else if (action === 'feature') updates.featured = true
  else if (action === 'unfeature') updates.featured = false
  else return

  const { data: profile, error } = await ctx.supabase
    .from('portora_talent_profiles')
    .update(updates)
    .eq('id', id)
    .select('id, username, ai_summary')
    .single()
  if (error || !profile) throw new Error(error?.message ?? 'Profil tidak ditemukan')

  await ctx.supabase.from('portora_moderation_logs').insert({
    admin_user_id: ctx.user.id,
    talent_profile_id: id,
    action,
    reason: action === 'reject' ? updates.rejection_reason : reason,
  })

  if (action === 'approve' && !profile.ai_summary) await refreshSummary(ctx, id)
  if (action === 'approve' || action === 'reject') {
    const reasonText = action === 'reject' ? (updates.rejection_reason as string) : null
    after(() => notifyModeration(id, action === 'approve', reasonText, profile.username))
  }
  revalidateAdmin(profile.username)
}

export async function regenerateSummary(formData: FormData) {
  const ctx = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  await refreshSummary(ctx, id)
  revalidateAdmin()
}

export async function setRecruiterPlan(formData: FormData) {
  const ctx = await requireAdmin()
  const userId = String(formData.get('user_id') ?? '')
  const plan = String(formData.get('plan') ?? '') as PlanId
  const months = Number(formData.get('months') ?? 0)
  if (!['starter', 'growth', 'enterprise'].includes(plan)) return

  const expires = plan !== 'starter' && months > 0 ? new Date(Date.now() + months * 30 * 86_400_000).toISOString() : null
  const { error } = await ctx.supabase
    .from('portora_recruiter_profiles')
    .update({ plan, plan_expires_at: expires, ...(plan === 'starter' ? { trial_ends_at: new Date().toISOString() } : {}) })
    .eq('user_id', userId)
  if (error) throw new Error(error.message)

  await ctx.supabase.from('portora_moderation_logs').insert({
    admin_user_id: ctx.user.id,
    recruiter_user_id: userId,
    action: 'set_plan',
    reason: `${plan}${expires ? ` s/d ${expires.slice(0, 10)}` : ''}`,
  })
  revalidatePath('/admin')
}
