export type TalentRole = 'graphic-designer' | 'video-editor' | 'content-creative'
export type TalentStatus = 'pending' | 'approved' | 'rejected'
export type AccountRole = 'talent' | 'recruiter'
export type PlanId = 'starter' | 'growth' | 'enterprise'
export type InviteStatus = 'sent' | 'accepted' | 'declined'
export type PortfolioMediaType = 'image' | 'video' | 'link'

export interface PortfolioLink {
  url: string
  label?: string
}

export interface TalentProfile {
  id: string
  user_id: string
  username: string
  full_name: string
  role: TalentRole
  headline: string | null
  location: string | null
  bio: string | null
  avatar_url: string | null
  portfolio_links: PortfolioLink[]
  skills: string[]
  tools: string[]
  industries: string[]
  experience_years: number | null
  available: boolean
  rate_min: number | null
  rate_max: number | null
  is_public: boolean
  status: TalentStatus
  featured: boolean
  rejection_reason: string | null
  ai_summary: string | null
  ai_summary_at: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string | null
}

export interface TalentContact {
  talent_profile_id: string
  whatsapp: string | null
  email: string | null
  updated_at: string
}

export interface PortfolioItem {
  id: string
  talent_profile_id: string
  title: string
  description: string | null
  media_url: string | null
  media_type: PortfolioMediaType
  link_url: string | null
  sort_order: number
  created_at: string
}

export interface RecruiterProfile {
  user_id: string
  company_name: string
  company_website: string | null
  industry: string | null
  company_size: string | null
  contact_name: string | null
  contact_whatsapp: string | null
  logo_url: string | null
  plan: PlanId
  plan_expires_at: string | null
  trial_ends_at: string | null
  search_month: string | null
  search_count: number
  created_at: string
  updated_at: string
}

export interface ShortlistEntry {
  id: string
  recruiter_user_id: string
  talent_profile_id: string
  note: string | null
  list_name: string
  created_at: string
}

export interface Invite {
  id: string
  recruiter_user_id: string
  talent_profile_id: string
  project_title: string
  message: string | null
  budget: string | null
  status: InviteStatus
  created_at: string
  responded_at: string | null
}

export interface ModerationLog {
  id: string
  admin_user_id: string | null
  talent_profile_id: string | null
  recruiter_user_id: string | null
  action: 'approve' | 'reject' | 'feature' | 'unfeature' | 'set_plan' | 'ai_summary'
  reason: string | null
  created_at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  whatsapp: string | null
  company: string | null
  role: 'recruiter' | 'talent' | 'other' | null
  source: string | null
  page: string | null
  created_at: string
}

export interface RecruiterLead {
  name: string
  company?: string
  email: string
  whatsapp?: string
  message?: string
}

export interface StoredRecruiterLead extends RecruiterLead {
  id: string
  source: string | null
  created_at: string
}

export interface PortfolioSubmission {
  id: string
  user_id: string
  candidate_name: string
  candidate_email: string
  candidate_location: string | null
  design_roles: string[] | null
  design_styles: string[] | null
  portfolio_url: string | null
  portfolio_summary: string | null
  overall_score: number | null
  strengths: string[] | null
  weaknesses: string[] | null
  best_works: string[] | null
  status: string
  created_at: string
}
