import { ROLE_TEMPLATES, type RoleTemplate } from './constants'
import type { TalentProfile } from '@/lib/supabase/types'

export interface FitScorePart {
  label: string
  score: number
  max: number
  note: string
}

export interface FitScore {
  template: RoleTemplate
  total: number
  parts: FitScorePart[]
}

const normalize = (s: string) => s.toLowerCase().replace(/^adobe\s+/, '').replace(/[^a-z0-9]/g, '')

function matches(have: string[], want: string[]) {
  const set = new Set(have.map(normalize))
  return want.filter(w => set.has(normalize(w)))
}

type FitInput = Pick<TalentProfile, 'role' | 'skills' | 'tools' | 'portfolio_links' | 'bio' | 'headline' | 'rate_min' | 'available'>

// Skor 0–100 terhadap template role: transparan & bisa dijelaskan ke recruiter.
export function computeFitScore(t: FitInput, portfolioItemCount: number, template: RoleTemplate = ROLE_TEMPLATES[t.role]): FitScore {
  const skills = t.skills ?? []
  const tools = t.tools ?? []
  const parts: FitScorePart[] = []

  const roleMatch = t.role === template.role
  parts.push({ label: 'Role', score: roleMatch ? 20 : 0, max: 20, note: roleMatch ? 'Sesuai template' : 'Role berbeda dari template' })

  const skillHits = matches(skills, template.skills)
  const skillNeed = Math.min(template.skills.length, 3)
  parts.push({
    label: 'Skill kunci',
    score: Math.round(Math.min(skillHits.length / skillNeed, 1) * 30),
    max: 30,
    note: skillHits.length ? skillHits.join(', ') : 'Belum ada skill kunci template',
  })

  const toolHits = matches(tools, template.tools)
  const toolNeed = Math.min(template.tools.length, 2)
  parts.push({
    label: 'Tools',
    score: Math.round(Math.min(toolHits.length / toolNeed, 1) * 20),
    max: 20,
    note: toolHits.length ? toolHits.join(', ') : 'Belum ada tools template',
  })

  const links = (t.portfolio_links ?? []).length
  const strength = portfolioItemCount + links * 0.5
  parts.push({
    label: 'Bukti karya',
    score: Math.round(Math.min(strength / 4, 1) * 20),
    max: 20,
    note: `${portfolioItemCount} karya diunggah · ${links} link`,
  })

  let ready = 0
  if (t.available) ready += 3
  if (t.bio && t.bio.trim().length >= 40) ready += 3
  if (t.headline) ready += 2
  if (t.rate_min) ready += 2
  parts.push({ label: 'Kesiapan profil', score: ready, max: 10, note: t.available ? 'Open to work' : 'Sedang tidak tersedia' })

  return { template, total: parts.reduce((sum, p) => sum + p.score, 0), parts }
}
