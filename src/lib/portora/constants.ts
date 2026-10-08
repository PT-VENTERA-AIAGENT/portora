import type { TalentRole } from '@/lib/supabase/types'

export const COLORS = {
  navy: '#1A365D',
  navyDark: '#0F2038',
  accent: '#0D9488',
  amber: '#D97706',
  base: '#FAFAF7',
  surface: '#FFFFFF',
  subtle: '#F3F4F6',
  line: '#E5E7EB',
  ink: '#0A0E1A',
  muted: '#6B7280',
  danger: '#DC2626',
} as const

export const ROLE_OPTIONS: { value: TalentRole; label: string; icon: string }[] = [
  { value: 'graphic-designer', label: 'Graphic Designer', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343' },
  { value: 'video-editor', label: 'Video Editor', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { value: 'content-creative', label: 'Social Media Creative', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
]

export const ROLE_LABELS: Record<TalentRole, string> = {
  'graphic-designer': 'Graphic Designer',
  'video-editor': 'Video Editor',
  'content-creative': 'Social Media Creative',
}

export const SKILLS: Record<TalentRole, string[]> = {
  'graphic-designer': ['Branding', 'Typography', 'Social Media Design', 'Motion Graphics', 'Illustration', 'Packaging'],
  'video-editor': ['Color Grading', 'Motion Graphics', 'Sound Design', 'Reels/Short', 'Storytelling', 'Subtitle'],
  'content-creative': ['Copywriting', 'Content Strategy', 'Reels', 'Feed Curation', 'Brand Voice', 'Community'],
}

export const TOOLS: Record<TalentRole, string[]> = {
  'graphic-designer': ['Figma', 'Adobe Illustrator', 'Photoshop', 'InDesign', 'Canva'],
  'video-editor': ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut', 'Final Cut Pro'],
  'content-creative': ['Canva', 'Figma', 'CapCut', 'Photoshop', 'Meta Business Suite'],
}

export const INDUSTRIES = [
  'Beauty & Fashion', 'F&B', 'E-commerce', 'Teknologi', 'Pendidikan', 'Kesehatan',
  'Keuangan', 'Properti', 'Media & Hiburan', 'Travel', 'Otomotif', 'Pemerintahan & NGO',
]

export const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+']

// "3 role template creative" (lihat announcement di landing page): satu template per role.
export interface RoleTemplate {
  role: TalentRole
  name: string
  skills: string[]
  tools: string[]
}

export const ROLE_TEMPLATES: Record<TalentRole, RoleTemplate> = {
  'graphic-designer': {
    role: 'graphic-designer',
    name: 'Graphic Designer — Social Media & Branding',
    skills: ['Branding', 'Typography', 'Social Media Design'],
    tools: ['Figma', 'Adobe Illustrator', 'Photoshop'],
  },
  'video-editor': {
    role: 'video-editor',
    name: 'Video Editor — Short-form & Ads',
    skills: ['Color Grading', 'Motion Graphics', 'Sound Design', 'Reels/Short'],
    tools: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'],
  },
  'content-creative': {
    role: 'content-creative',
    name: 'Social Media Creative — Konten Brand',
    skills: ['Copywriting', 'Content Strategy', 'Reels', 'Feed Curation'],
    tools: ['Canva', 'Figma', 'CapCut'],
  },
}

export const DEFAULT_SHORTLIST = 'Shortlist utama'

export const BUCKETS = {
  avatars: 'portora-avatars',
  portfolio: 'portora-portfolio',
} as const
