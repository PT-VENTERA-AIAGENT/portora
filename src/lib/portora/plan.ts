import type { PlanId, RecruiterProfile } from '@/lib/supabase/types'

// Batas paket mengikuti halaman /pricing.
export const PLANS: Record<PlanId, { label: string; price: string }> = {
  starter: { label: 'Starter', price: 'Gratis' },
  growth: { label: 'Growth', price: 'Rp 499K / bulan' },
  enterprise: { label: 'Enterprise', price: 'Custom' },
}

export const STARTER_LIMITS = {
  searchesPerMonth: 5,
  shortlists: 1,
  portfolioPreview: 3,
}

export interface PlanState {
  plan: PlanId
  onTrial: boolean
  trialDaysLeft: number | null
  paidUntil: string | null
}

// Harus sama dengan fungsi SQL portora_effective_plan.
export function effectivePlan(r: Pick<RecruiterProfile, 'plan' | 'plan_expires_at' | 'trial_ends_at'> | null): PlanState {
  if (!r) return { plan: 'starter', onTrial: false, trialDaysLeft: null, paidUntil: null }
  const now = Date.now()
  if (r.plan !== 'starter' && (!r.plan_expires_at || new Date(r.plan_expires_at).getTime() > now)) {
    return { plan: r.plan, onTrial: false, trialDaysLeft: null, paidUntil: r.plan_expires_at }
  }
  if (r.trial_ends_at && new Date(r.trial_ends_at).getTime() > now) {
    const days = Math.ceil((new Date(r.trial_ends_at).getTime() - now) / 86_400_000)
    return { plan: 'growth', onTrial: true, trialDaysLeft: days, paidUntil: null }
  }
  return { plan: 'starter', onTrial: false, trialDaysLeft: null, paidUntil: null }
}

export function isGrowth(plan: PlanId) {
  return plan !== 'starter'
}

export function currentMonth(date = new Date()) {
  return date.toISOString().slice(0, 7)
}

export function searchesUsed(r: Pick<RecruiterProfile, 'search_month' | 'search_count'> | null) {
  if (!r || r.search_month !== currentMonth()) return 0
  return r.search_count
}
