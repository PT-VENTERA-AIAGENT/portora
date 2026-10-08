import type { AccountRole } from '@/lib/supabase/types'

export function initials(name: string) {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function formatRate(min: number | null, max: number | null) {
  if (!min) return null
  const k = (n: number) => `${Math.round(n / 1000)}K`
  return max && max > min ? `Rp ${k(min)}–${k(max)} / jam` : `Rp ${k(min)} / jam`
}

export function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 40) || 'talent'
}

// "salesmetri.id" -> "https://salesmetri.id". Skema lain (mis. javascript:) dibiarkan agar ditolak validasi.
export function normalizeUrl(raw: string | null | undefined) {
  const s = (raw ?? '').trim()
  if (!s || /^[a-z][a-z0-9+.-]*:/i.test(s)) return s
  return `https://${s.replace(/^\/+/, '')}`
}

export function isHttpUrl(s: string) {
  return /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(s)
}

// 0812xxxx / +62812xxxx / 62812xxxx -> 62812xxxx (format wa.me)
export function waNumber(raw: string | null) {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}

export function homePathFor(role: AccountRole | null | undefined) {
  if (role === 'talent') return '/dashboard'
  if (role === 'recruiter') return '/discover'
  return '/welcome'
}

// Hanya izinkan redirect internal (hindari open redirect lewat ?next=).
export function safeNext(next: string | null | undefined) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null
  return next
}
