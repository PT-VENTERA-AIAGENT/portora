import { redirect } from 'next/navigation'
import { getOwnRecruiterProfile, getViewer } from '@/lib/portora/session'
import { effectivePlan, isGrowth } from '@/lib/portora/plan'
import type { Invite, ShortlistEntry, TalentContact, TalentProfile } from '@/lib/supabase/types'
import ShortlistsClient, { type ShortlistRow } from './ShortlistsClient'

export const metadata = { title: 'Shortlist' }

export default async function ShortlistsPage() {
  const { supabase, user } = await getViewer()
  if (!user) redirect('/login?next=/shortlists')
  const company = await getOwnRecruiterProfile()
  if (!company) redirect('/company')

  const { data: entryRows } = await supabase
    .from('portora_shortlists')
    .select('*')
    .eq('recruiter_user_id', user.id)
    .order('created_at', { ascending: true })
  const entries = (entryRows ?? []) as ShortlistEntry[]
  const talentIds = entries.map(e => e.talent_profile_id)

  const [{ data: talentRows }, { data: inviteRows }] = talentIds.length
    ? await Promise.all([
        supabase.from('portora_talent_profiles').select('*').in('id', talentIds),
        supabase.from('portora_invites').select('*').eq('recruiter_user_id', user.id).in('talent_profile_id', talentIds).order('created_at', { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }]

  const talents = new Map(((talentRows ?? []) as TalentProfile[]).map(t => [t.id, t]))
  const latestInvite = new Map<string, Invite>()
  for (const invite of (inviteRows ?? []) as Invite[]) {
    if (!latestInvite.has(invite.talent_profile_id) || invite.status === 'accepted') latestInvite.set(invite.talent_profile_id, invite)
  }

  const acceptedIds = [...latestInvite.values()].filter(i => i.status === 'accepted').map(i => i.talent_profile_id)
  const { data: contactRows } = acceptedIds.length
    ? await supabase.from('portora_talent_contacts').select('*').in('talent_profile_id', acceptedIds)
    : { data: [] }
  const contacts = new Map(((contactRows ?? []) as TalentContact[]).map(c => [c.talent_profile_id, c]))

  // Talent yang sudah tidak publik (mis. disembunyikan) tidak ikut ditampilkan.
  const rows: ShortlistRow[] = entries.flatMap(entry => {
    const talent = talents.get(entry.talent_profile_id)
    if (!talent) return []
    return [{
      entry,
      talent,
      inviteStatus: latestInvite.get(talent.id)?.status ?? null,
      contact: contacts.get(talent.id) ?? null,
    }]
  })

  return <ShortlistsClient rows={rows} growth={isGrowth(effectivePlan(company).plan)} />
}
