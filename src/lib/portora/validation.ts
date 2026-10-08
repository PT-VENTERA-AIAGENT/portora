import { z } from 'zod'
import { isHttpUrl, normalizeUrl } from './format'

const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform(v => (v ? v : null))

// Hanya http(s): mencegah link javascript: ikut tersimpan lalu dirender sebagai href.
const HTTP_URL = /^https?:\/\/\S+$/i
const LINK_HINT = 'harus berupa link lengkap, mis. https://behance.net/namamu'

// URL hasil upload kita sendiri (bisa localhost saat dev).
const optionalUrl = z
  .string()
  .trim()
  .nullish()
  .transform(v => (v ? v : null))
  .refine(v => v === null || HTTP_URL.test(v), 'harus berupa URL (https://…)')

// Link yang diketik user: "salesmetri.id" dirapikan jadi "https://salesmetri.id".
const link = z.string().transform(normalizeUrl).refine(isHttpUrl, LINK_HINT)
const optionalLink = z
  .string()
  .nullish()
  .transform(v => normalizeUrl(v) || null)
  .refine(v => v === null || isHttpUrl(v), LINK_HINT)

const optionalInt = (max: number) =>
  z.number().int().min(0).max(max).nullish().transform(v => (v === undefined ? null : v))

const tag = z.string().trim().min(1).max(40)

export const talentProfileSchema = z
  .object({
    full_name: z.string().trim().min(2, 'minimal 2 karakter').max(80),
    role: z.enum(['graphic-designer', 'video-editor', 'content-creative']),
    headline: optionalText(120),
    bio: optionalText(1500),
    location: optionalText(80),
    experience_years: optionalInt(50),
    rate_min: optionalInt(100_000_000),
    rate_max: optionalInt(100_000_000),
    skills: z.array(tag).min(1, 'pilih minimal 1 skill').max(20),
    tools: z.array(tag).max(20),
    industries: z.array(tag).max(12),
    portfolio_links: z
      .array(z.object({ url: link, label: optionalText(80) }))
      .max(10),
    available: z.boolean(),
    avatar_url: optionalUrl,
    whatsapp: z.string().trim().regex(/^\+?[0-9][0-9\s-]{7,18}$/, 'nomor WhatsApp tidak valid'),
    contact_email: z
      .string()
      .trim()
      .nullish()
      .transform(v => (v ? v : null))
      .refine(v => v === null || z.string().email().safeParse(v).success, 'email tidak valid'),
  })
  .refine(v => !v.rate_min || !v.rate_max || v.rate_max >= v.rate_min, {
    message: 'tarif maksimal harus lebih besar dari tarif minimal',
    path: ['rate_max'],
  })

export type TalentProfileInput = z.input<typeof talentProfileSchema>

export const portfolioItemSchema = z
  .object({
    title: z.string().trim().min(2, 'judul karya minimal 2 karakter').max(100),
    description: optionalText(400),
    media_type: z.enum(['image', 'video', 'link']),
    media_url: optionalUrl,
    link_url: optionalLink,
  })
  .refine(v => (v.media_type === 'image' ? !!v.media_url : !!v.link_url), {
    message: 'karya butuh gambar atau link',
    path: ['media_url'],
  })

export type PortfolioItemInput = z.input<typeof portfolioItemSchema>

export const companyProfileSchema = z.object({
  company_name: z.string().trim().min(2, 'nama perusahaan minimal 2 karakter').max(120),
  company_website: optionalLink,
  industry: optionalText(60),
  company_size: optionalText(20),
  contact_name: optionalText(80),
  contact_whatsapp: z
    .string()
    .trim()
    .nullish()
    .transform(v => (v ? v : null))
    .refine(v => v === null || /^\+?[0-9][0-9\s-]{7,18}$/.test(v), 'nomor WhatsApp tidak valid'),
})

export type CompanyProfileInput = z.input<typeof companyProfileSchema>

export const inviteSchema = z.object({
  talent_profile_id: z.string().uuid(),
  project_title: z.string().trim().min(3, 'judul proyek minimal 3 karakter').max(120),
  message: optionalText(1000),
  budget: optionalText(80),
})

export type InviteInput = z.input<typeof inviteSchema>

const FIELD_LABELS: Record<string, string> = {
  full_name: 'Nama',
  role: 'Role',
  headline: 'Headline',
  bio: 'Bio',
  location: 'Lokasi',
  experience_years: 'Pengalaman',
  rate_min: 'Tarif minimal',
  rate_max: 'Tarif maksimal',
  skills: 'Skill',
  tools: 'Tools',
  industries: 'Industri',
  portfolio_links: 'Link portfolio',
  whatsapp: 'WhatsApp',
  contact_email: 'Email kontak',
  avatar_url: 'Foto profil',
  title: 'Judul karya',
  media_url: 'Karya',
  link_url: 'Link karya',
  company_name: 'Nama perusahaan',
  company_website: 'Website',
  contact_whatsapp: 'WhatsApp',
  project_title: 'Judul proyek',
  message: 'Pesan',
  budget: 'Budget',
}

export function firstIssue(error: z.ZodError) {
  const issue = error.issues[0]
  const field = FIELD_LABELS[String(issue.path[0])] ?? 'Data'
  return `${field}: ${issue.message}`
}
