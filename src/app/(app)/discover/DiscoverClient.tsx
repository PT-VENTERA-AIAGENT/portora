'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { recordSearch } from '@/app/actions/recruiter'
import { ROLE_LABELS, ROLE_OPTIONS, ROLE_TEMPLATES, SKILLS, TOOLS } from '@/lib/portora/constants'
import { computeFitScore } from '@/lib/portora/fit-score'
import { isGrowth, STARTER_LIMITS } from '@/lib/portora/plan'
import { formatRate } from '@/lib/portora/format'
import type { PlanId, PortfolioItem, TalentProfile, TalentRole } from '@/lib/supabase/types'
import TalentAvatar from '@/components/portora/TalentAvatar'
import SaveButton from '@/components/portora/SaveButton'
import { fitColor } from '@/components/portora/FitScoreCard'

const RATE_OPTIONS = [
  { value: '', label: 'Semua tarif' },
  { value: '100000', label: '≤ Rp 100K / jam' },
  { value: '200000', label: '≤ Rp 200K / jam' },
  { value: '300000', label: '≤ Rp 300K / jam' },
  { value: '500000', label: '≤ Rp 500K / jam' },
]

const selectClass = 'bg-surface border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-navy'
// Karakter ini punya arti khusus di filter PostgREST (or=, ilike).
const sanitize = (s: string) => s.replace(/[%*,()"\\]/g, ' ').replace(/\s+/g, ' ').trim()

export default function DiscoverClient({ counts, savedIds, plan, searchesLeft: initialLeft }: {
  counts: Record<TalentRole, number>
  savedIds: string[]
  plan: PlanId
  searchesLeft: number | null
}) {
  const [talents, setTalents] = useState<TalentProfile[]>([])
  const [items, setItems] = useState<Record<string, PortfolioItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<TalentRole | null>(null)
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [skill, setSkill] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sort, setSort] = useState<'newest' | 'fit'>('newest')
  const [searchesLeft, setSearchesLeft] = useState(initialLeft)
  const [searching, setSearching] = useState(false)
  const growth = isGrowth(plan)
  const saved = useMemo(() => new Set(savedIds), [savedIds])

  const skillOptions = useMemo(() => {
    const roles = role ? [role] : ROLE_OPTIONS.map(r => r.value)
    return [...new Set(roles.flatMap(r => [...SKILLS[r], ...TOOLS[r]]))].sort()
  }, [role])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const supabase = createClient()
      let q = supabase
        .from('portora_talent_profiles')
        .select('*')
        .eq('status', 'approved')
        .eq('is_public', true)

      if (role) q = q.eq('role', role)
      const term = sanitize(query)
      if (term) q = q.or(`full_name.ilike.%${term}%,headline.ilike.%${term}%,bio.ilike.%${term}%,location.ilike.%${term}%`)
      const loc = sanitize(location)
      if (loc) q = q.ilike('location', `%${loc}%`)
      if (availableOnly) q = q.eq('available', true)
      if (skill) q = q.or(`skills.cs.{"${skill}"},tools.cs.{"${skill}"}`)
      if (maxRate) q = q.lte('rate_min', Number(maxRate))

      const { data, error } = await q.order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(60)
      if (cancelled) return
      if (error) {
        toast.error('Gagal memuat talent. Coba lagi.')
        setTalents([])
        setLoading(false)
        return
      }
      const rows = (data ?? []) as TalentProfile[]
      const grouped: Record<string, PortfolioItem[]> = {}
      if (rows.length) {
        const { data: itemRows } = await supabase
          .from('portora_portfolio_items')
          .select('*')
          .in('talent_profile_id', rows.map(r => r.id))
          .order('sort_order', { ascending: true })
        for (const item of (itemRows ?? []) as PortfolioItem[]) (grouped[item.talent_profile_id] ??= []).push(item)
      }
      if (cancelled) return
      setTalents(rows)
      setItems(grouped)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [role, query, location, availableOnly, skill, maxRate])

  const scored = useMemo(() => {
    const list = talents.map(t => ({
      talent: t,
      fit: computeFitScore(t, items[t.id]?.length ?? 0, ROLE_TEMPLATES[role ?? t.role]),
    }))
    if (sort === 'fit' && growth) list.sort((a, b) => b.fit.total - a.fit.total)
    return list
  }, [talents, items, role, sort, growth])

  const quotaOut = !growth && searchesLeft === 0

  async function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const term = draft.trim()
    if (term === query) return
    if (!term) { setQuery(''); return }
    if (!growth) {
      if (quotaOut) {
        toast.error(`Kuota ${STARTER_LIMITS.searchesPerMonth} pencarian bulan ini sudah habis. Upgrade ke Growth untuk pencarian tak terbatas.`)
        return
      }
      setSearching(true)
      const result = await recordSearch()
      setSearching(false)
      if (result.error) { toast.error(result.error); return }
      setSearchesLeft(result.remaining ?? null)
      if (!result.allowed) {
        toast.error(`Kuota ${STARTER_LIMITS.searchesPerMonth} pencarian bulan ini sudah habis. Upgrade ke Growth untuk pencarian tak terbatas.`)
        return
      }
    }
    setQuery(term)
  }

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted mb-2 font-mono">
          <span>Workspace</span><span>/</span><span className="text-ink">Discover</span>
        </div>
        <h1 className="text-3xl font-display tracking-tight">Talent search</h1>
      </div>

      {/* Role filter */}
      <div className="bg-surface border border-line rounded-xl p-4 mb-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted mb-3">Role</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => { setRole(role === r.value ? null : r.value); setSkill('') }}
              className={`border rounded-lg p-3 flex items-center gap-3 transition-colors ${role === r.value ? 'border-2 border-navy bg-navy/5' : 'border-line bg-surface hover:border-navy'}`}
            >
              <div className={`w-9 h-9 rounded-md flex items-center justify-center ${role === r.value ? 'bg-navy text-white' : 'bg-subtle text-muted'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">{r.label}</p>
                <p className="text-xs text-muted">{counts[r.value]} talent</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search & filters */}
      <form onSubmit={submitSearch} className="flex gap-2 mb-2">
        <div className="flex-1 bg-surface border border-line rounded-lg flex items-center px-4 py-2.5 focus-within:border-navy transition-colors">
          <svg className="w-4 h-4 text-muted mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={draft}
            onChange={e => { setDraft(e.target.value); if (!e.target.value) setQuery('') }}
            placeholder="Cari nama, headline, bio, atau lokasi…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <button type="submit" disabled={searching} className="text-white px-5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: '#1A365D' }}>
          {searching ? '…' : 'Cari'}
        </button>
      </form>
      {!growth && (
        <p className="text-xs text-muted mb-4">
          Sisa pencarian teks bulan ini: <span className="font-mono">{searchesLeft ?? 0}/{STARTER_LIMITS.searchesPerMonth}</span> (paket Starter). Filter di bawah tidak dihitung.{' '}
          <Link href="/company#paket" className="hover:underline" style={{ color: '#1A365D' }}>Upgrade</Link>
        </p>
      )}
      <div className="flex flex-wrap gap-2 mb-6 mt-3">
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Lokasi (mis. Jakarta)" className={`${selectClass} w-44`} />
        <select value={skill} onChange={e => setSkill(e.target.value)} className={selectClass}>
          <option value="">Semua skill & tools</option>
          {skillOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={maxRate} onChange={e => setMaxRate(e.target.value)} className={selectClass}>
          {RATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label className={`${selectClass} flex items-center gap-2 cursor-pointer`}>
          <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} className="accent-[#0D9488]" />
          Open to work
        </label>
        <select value={sort} onChange={e => setSort(e.target.value as 'newest' | 'fit')} className={selectClass}>
          <option value="newest">Urutkan: terbaru</option>
          <option value="fit" disabled={!growth}>Urutkan: fit score{growth ? '' : ' (Growth)'}</option>
        </select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm">
          <span className="font-semibold">{loading ? '…' : talents.length}</span>{' '}
          <span className="text-muted">talent {role ? `(${ROLE_LABELS[role]})` : 'semua role'}</span>
        </p>
        {growth && role && <p className="text-xs text-muted">Fit score: {ROLE_TEMPLATES[role].name}</p>}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="bg-surface border border-line rounded-xl p-4 h-20 animate-pulse" />)}
        </div>
      ) : scored.length === 0 ? (
        <div className="bg-surface border border-line rounded-xl p-10 text-center">
          <p className="font-medium mb-1">Belum ada talent yang cocok</p>
          <p className="text-sm text-muted">Coba longgarkan filter atau ganti kata kunci.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scored.map(({ talent: t, fit }) => {
            const thumbs = (items[t.id] ?? []).slice(0, 3)
            const rate = formatRate(t.rate_min, t.rate_max)
            return (
              <div key={t.id} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-4 hover:border-navy transition-colors">
                <Link href={`/talent/${t.username}`} className="flex-1 min-w-0 flex items-center gap-4">
                  <TalentAvatar name={t.full_name} url={t.avatar_url} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-medium">{t.full_name}</p>
                      {t.available && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">Open</span>}
                      {t.featured && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#D97706' }}>Featured</span>}
                    </div>
                    {t.headline && <p className="text-sm truncate">{t.headline}</p>}
                    <p className="text-xs text-muted truncate">
                      {ROLE_LABELS[t.role]}
                      {t.location ? ` · ${t.location}` : ''}
                      {t.skills.length > 0 ? ` · ${t.skills.slice(0, 3).join(', ')}` : ''}
                    </p>
                  </div>
                  <div className="hidden md:flex gap-1.5 flex-shrink-0">
                    {[0, 1, 2].map(i => {
                      const item = thumbs[i]
                      return item?.media_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={item.media_url} alt={item.title} className="w-12 h-12 rounded-md object-cover border border-line" loading="lazy" />
                      ) : (
                        <div key={i} className="w-12 h-12 rounded-md bg-subtle border border-line" />
                      )
                    })}
                  </div>
                  {rate && (
                    <div className="hidden sm:block text-right flex-shrink-0 ml-2 w-24">
                      <p className="text-[10px] text-muted">Rate</p>
                      <p className="font-mono text-xs font-semibold">{rate.replace('Rp ', '').replace(' / jam', '/jam')}</p>
                    </div>
                  )}
                  {growth && (
                    <div className="text-right flex-shrink-0 w-14">
                      <p className="text-[10px] text-muted">Fit</p>
                      <p className="font-mono text-lg font-semibold leading-tight" style={{ color: fitColor(fit.total) }}>{fit.total}</p>
                    </div>
                  )}
                </Link>
                <SaveButton talentId={t.id} initialSaved={saved.has(t.id)} />
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
