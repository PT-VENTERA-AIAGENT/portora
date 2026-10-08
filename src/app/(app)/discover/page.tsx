import { redirect } from 'next/navigation'
import { getOwnRecruiterProfile, getViewer } from '@/lib/portora/session'
import { effectivePlan, searchesUsed, STARTER_LIMITS } from '@/lib/portora/plan'
import { ROLE_OPTIONS } from '@/lib/portora/constants'
import type { TalentRole } from '@/lib/supabase/types'
import DiscoverClient from './DiscoverClient'

export const metadata = { title: 'Talent search' }

export default async function DiscoverPage() {
  const { supabase, user } = await getViewer()
  if (!user) redirect('/login?next=/discover')
  const company = await getOwnRecruiterProfile()
  if (!company) redirect('/company')

  const plan = effectivePlan(company)

  // Jumlah talent per role dihitung dari DB (bukan angka statis).
  const countResults = await Promise.all(
    ROLE_OPTIONS.map(r =>
      supabase
        .from('portora_talent_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('is_public', true)
        .eq('role', r.value),
    ),
  )
  const counts = Object.fromEntries(ROLE_OPTIONS.map((r, i) => [r.value, countResults[i].count ?? 0])) as Record<TalentRole, number>

  const { data: saved } = await supabase
    .from('portora_shortlists')
    .select('talent_profile_id')
    .eq('recruiter_user_id', user.id)

  return (
    <DiscoverClient
      counts={counts}
      savedIds={(saved ?? []).map(s => s.talent_profile_id as string)}
      plan={plan.plan}
      searchesLeft={plan.plan === 'starter' ? Math.max(0, STARTER_LIMITS.searchesPerMonth - searchesUsed(company)) : null}
    />
  )
}
