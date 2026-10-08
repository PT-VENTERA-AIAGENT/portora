'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { notifyInviteReceived } from '@/lib/portora/email'
import { getOwnRecruiterProfile, getViewer } from '@/lib/portora/session'
import { currentMonth, effectivePlan, isGrowth, searchesUsed, STARTER_LIMITS } from '@/lib/portora/plan'
import { DEFAULT_SHORTLIST } from '@/lib/portora/constants'
import { companyProfileSchema, firstIssue, inviteSchema, type CompanyProfileInput, type InviteInput } from '@/lib/portora/validation'

type Result<T = object> = ({ error: string } & Partial<T>) | ({ error?: undefined } & T)

async function requireRecruiter(needsCompany = true) {
  const viewer = await getViewer()
  if (!viewer.user) return { error: 'Sesi berakhir. Silakan login lagi.' }
  if (viewer.role !== 'recruiter') return { error: 'Hanya akun recruiter yang bisa melakukan ini.' }
  const company = await getOwnRecruiterProfile()
  if (needsCompany && !company) return { error: 'Lengkapi profil perusahaan dulu.' }
  return { ...viewer, error: null, user: viewer.user, company, plan: effectivePlan(company) }
}

export async function saveCompanyProfile(input: CompanyProfileInput): Promise<Result<{ created: boolean }>> {
  const ctx = await requireRecruiter(false)
  if (ctx.error !== null) return { error: ctx.error }

  const parsed = companyProfileSchema.safeParse(input)
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const { error } = ctx.company
    ? await ctx.supabase.from('portora_recruiter_profiles').update(parsed.data).eq('user_id', ctx.user.id)
    : await ctx.supabase.from('portora_recruiter_profiles').insert({ ...parsed.data, user_id: ctx.user.id })
  if (error) return { error: error.message }

  revalidatePath('/company')
  revalidatePath('/discover')
  return { created: !ctx.company }
}

// Starter: 5 pencarian teks per bulan. Growth/Enterprise: tak terbatas.
export async function recordSearch(): Promise<Result<{ allowed: boolean; remaining: number | null }>> {
  const ctx = await requireRecruiter()
  if (ctx.error !== null) return { error: ctx.error }
  if (isGrowth(ctx.plan.plan)) return { allowed: true, remaining: null }

  const used = searchesUsed(ctx.company)
  if (used >= STARTER_LIMITS.searchesPerMonth) return { allowed: false, remaining: 0 }

  const { error } = await ctx.supabase
    .from('portora_recruiter_profiles')
    .update({ search_month: currentMonth(), search_count: used + 1 })
    .eq('user_id', ctx.user.id)
  if (error) return { error: error.message }
  return { allowed: true, remaining: STARTER_LIMITS.searchesPerMonth - used - 1 }
}

async function listNames(ctx: Exclude<Awaited<ReturnType<typeof requireRecruiter>>, { error: string }>) {
  const { data } = await ctx.supabase
    .from('portora_shortlists')
    .select('list_name, created_at')
    .eq('recruiter_user_id', ctx.user.id)
    .order('created_at', { ascending: true })
  return [...new Set((data ?? []).map(r => r.list_name as string))]
}

export async function toggleShortlist(talentProfileId: string): Promise<Result<{ saved: boolean }>> {
  const ctx = await requireRecruiter()
  if (ctx.error !== null) return { error: ctx.error }

  const { data: existing } = await ctx.supabase
    .from('portora_shortlists')
    .select('id')
    .eq('recruiter_user_id', ctx.user.id)
    .eq('talent_profile_id', talentProfileId)
    .maybeSingle()

  if (existing) {
    const { error } = await ctx.supabase.from('portora_shortlists').delete().eq('id', existing.id)
    if (error) return { error: error.message }
    revalidatePath('/shortlists')
    return { saved: false }
  }

  const [firstList] = await listNames(ctx)
  const { error } = await ctx.supabase.from('portora_shortlists').insert({
    recruiter_user_id: ctx.user.id,
    talent_profile_id: talentProfileId,
    list_name: firstList ?? DEFAULT_SHORTLIST,
  })
  if (error) return { error: error.message }
  revalidatePath('/shortlists')
  return { saved: true }
}

export async function moveShortlistEntry(entryId: string, listName: string): Promise<Result> {
  const ctx = await requireRecruiter()
  if (ctx.error !== null) return { error: ctx.error }
  const name = listName.trim().slice(0, 60)
  if (!name) return { error: 'Nama shortlist wajib diisi.' }

  const { data: entry } = await ctx.supabase
    .from('portora_shortlists')
    .select('id, list_name')
    .eq('id', entryId)
    .eq('recruiter_user_id', ctx.user.id)
    .maybeSingle()
  if (!entry) return { error: 'Data shortlist tidak ditemukan.' }

  if (!isGrowth(ctx.plan.plan)) {
    const { count } = await ctx.supabase
      .from('portora_shortlists')
      .select('id', { count: 'exact', head: true })
      .eq('recruiter_user_id', ctx.user.id)
      .neq('id', entryId)
      .neq('list_name', name)
    if ((count ?? 0) > 0) {
      return { error: `Paket Starter hanya bisa memakai ${STARTER_LIMITS.shortlists} shortlist. Upgrade ke Growth untuk shortlist tak terbatas.` }
    }
  }

  const { error } = await ctx.supabase.from('portora_shortlists').update({ list_name: name }).eq('id', entryId)
  if (error) return { error: error.message }
  revalidatePath('/shortlists')
  return {}
}

export async function renameShortlist(oldName: string, newName: string): Promise<Result> {
  const ctx = await requireRecruiter()
  if (ctx.error !== null) return { error: ctx.error }
  const name = newName.trim().slice(0, 60)
  if (!name) return { error: 'Nama shortlist wajib diisi.' }

  const { error } = await ctx.supabase
    .from('portora_shortlists')
    .update({ list_name: name })
    .eq('recruiter_user_id', ctx.user.id)
    .eq('list_name', oldName)
  if (error) return { error: error.message }
  revalidatePath('/shortlists')
  return {}
}

export async function updateShortlistNote(entryId: string, note: string): Promise<Result> {
  const ctx = await requireRecruiter()
  if (ctx.error !== null) return { error: ctx.error }
  const { error } = await ctx.supabase
    .from('portora_shortlists')
    .update({ note: note.trim().slice(0, 500) || null })
    .eq('id', entryId)
    .eq('recruiter_user_id', ctx.user.id)
  if (error) return { error: error.message }
  revalidatePath('/shortlists')
  return {}
}

export async function removeShortlistEntry(entryId: string): Promise<Result> {
  const ctx = await requireRecruiter()
  if (ctx.error !== null) return { error: ctx.error }
  const { error } = await ctx.supabase
    .from('portora_shortlists')
    .delete()
    .eq('id', entryId)
    .eq('recruiter_user_id', ctx.user.id)
  if (error) return { error: error.message }
  revalidatePath('/shortlists')
  return {}
}

export async function sendInvite(input: InviteInput): Promise<Result> {
  const ctx = await requireRecruiter()
  if (ctx.error !== null) return { error: ctx.error }

  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const { data: talent } = await ctx.supabase
    .from('portora_talent_profiles')
    .select('id, username, status, is_public')
    .eq('id', parsed.data.talent_profile_id)
    .maybeSingle()
  if (!talent || talent.status !== 'approved' || !talent.is_public) return { error: 'Talent tidak ditemukan.' }

  const { count } = await ctx.supabase
    .from('portora_invites')
    .select('id', { count: 'exact', head: true })
    .eq('recruiter_user_id', ctx.user.id)
    .eq('talent_profile_id', talent.id)
    .eq('status', 'sent')
  if ((count ?? 0) > 0) return { error: 'Undanganmu sebelumnya ke talent ini masih menunggu jawaban.' }

  const { error } = await ctx.supabase.from('portora_invites').insert({ ...parsed.data, recruiter_user_id: ctx.user.id })
  if (error) return { error: error.message }

  const companyName = ctx.company!.company_name
  after(() => notifyInviteReceived(talent.id, companyName, parsed.data.project_title))

  revalidatePath('/invites')
  revalidatePath(`/talent/${talent.username}`)
  return {}
}

// Belum ada payment gateway: permintaan upgrade masuk ke leads, admin mengaktifkan paket dari /admin.
export async function requestUpgrade(): Promise<Result> {
  const ctx = await requireRecruiter()
  if (ctx.error !== null) return { error: ctx.error }
  const company = ctx.company!

  const { error } = await ctx.supabase.from('portora_leads').insert({
    name: company.contact_name || company.company_name,
    email: ctx.user.email ?? '',
    whatsapp: company.contact_whatsapp,
    company: company.company_name,
    role: 'recruiter',
    source: 'upgrade-request',
    page: '/company',
  })
  if (error) return { error: error.message }
  return {}
}
