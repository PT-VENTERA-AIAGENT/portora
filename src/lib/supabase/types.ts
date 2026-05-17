export type TalentRole = 'graphic-designer' | 'video-editor' | 'content-creative'

export interface TalentProfile {
  id: string
  user_id: string
  username: string
  full_name: string
  role: TalentRole
  location: string | null
  bio: string | null
  avatar_url: string | null
  portfolio_links: { url: string; label: string }[]
  skills: string[]
  tools: string[]
  available: boolean
  rate_min: number | null
  rate_max: number | null
  is_public: boolean
  created_at: string
}

export interface RecruiterLead {
  name: string
  company?: string
  email: string
  whatsapp?: string
  message?: string
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
