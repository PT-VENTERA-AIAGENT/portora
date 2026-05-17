'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { TalentProfile } from '@/lib/supabase/types'

const ROLE_OPTIONS = [
  { value: 'graphic-designer', label: 'Graphic Designer', count: 824, icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343' },
  { value: 'video-editor', label: 'Video Editor', count: 612, icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { value: 'content-creative', label: 'Social Creative', count: 964, icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
]

const GRADIENT_PAIRS = [
  ['from-rose-400 to-purple-500', 'from-amber-400 to-red-500', 'from-teal-400 to-emerald-600'],
  ['from-blue-400 to-indigo-500', 'from-green-400 to-teal-500', 'from-pink-400 to-rose-500'],
  ['from-yellow-400 to-orange-500', 'from-purple-400 to-pink-500', 'from-cyan-400 to-blue-500'],
]

// Fallback mock data when DB is empty
const MOCK_TALENTS: TalentProfile[] = [
  { id: '1', user_id: '', username: 'rayhan-aditya', full_name: 'Rayhan Aditya', role: 'graphic-designer', location: 'Jakarta', bio: null, avatar_url: null, portfolio_links: [], skills: ['Branding', 'Social Media'], tools: ['Figma', 'Illustrator'], available: true, rate_min: 150000, rate_max: 300000, is_public: true, created_at: '' },
  { id: '2', user_id: '', username: 'dina-sari', full_name: 'Dina Sari', role: 'video-editor', location: 'Bandung', bio: null, avatar_url: null, portfolio_links: [], skills: ['Motion', 'Color Grading'], tools: ['Premiere Pro', 'After Effects'], available: true, rate_min: 200000, rate_max: 500000, is_public: true, created_at: '' },
  { id: '3', user_id: '', username: 'andi-pratama', full_name: 'Andi Pratama', role: 'content-creative', location: 'Surabaya', bio: null, avatar_url: null, portfolio_links: [], skills: ['Copywriting', 'Reels'], tools: ['Canva', 'CapCut'], available: false, rate_min: 100000, rate_max: 250000, is_public: true, created_at: '' },
  { id: '4', user_id: '', username: 'siti-rahma', full_name: 'Siti Rahma', role: 'graphic-designer', location: 'Jakarta', bio: null, avatar_url: null, portfolio_links: [], skills: ['Branding', 'Typography'], tools: ['Figma', 'Photoshop'], available: true, rate_min: 200000, rate_max: 400000, is_public: true, created_at: '' },
]

export default function DiscoverPage() {
  const [talents, setTalents] = useState<TalentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchTalents() {
      const supabase = createClient()
      let query = supabase
        .from('portora_talent_profiles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (activeRole) query = query.eq('role', activeRole)
      if (search) query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%`)

      const { data, error } = await query
      if (error || !data || data.length === 0) {
        // Fallback to mock data when table is empty or doesn't exist yet
        setTalents(activeRole ? MOCK_TALENTS.filter(t => t.role === activeRole) : MOCK_TALENTS)
      } else {
        setTalents(data)
      }
      setLoading(false)
    }
    fetchTalents()
  }, [activeRole, search])

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const getGradients = (index: number) => GRADIENT_PAIRS[index % GRADIENT_PAIRS.length]

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
        <div className="grid grid-cols-3 gap-2">
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setActiveRole(activeRole === r.value ? null : r.value)}
              className={`border rounded-lg p-3 flex items-center gap-3 transition-colors ${activeRole === r.value ? 'border-2 border-navy bg-navy/5' : 'border-line bg-surface hover:border-navy'}`}
            >
              <div className={`w-9 h-9 rounded-md flex items-center justify-center ${activeRole === r.value ? 'bg-navy text-white' : 'bg-subtle text-muted'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">{r.label}</p>
                <p className="text-xs text-muted">{talents.filter(t => t.role === r.value).length || r.count} talents</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 bg-surface border border-line rounded-lg flex items-center px-4 py-2.5 focus-within:border-navy transition-colors">
          <svg className="w-4 h-4 text-muted mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, skill, lokasi…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm">
          <span className="font-semibold">{loading ? '…' : talents.length}</span>{' '}
          <span className="text-muted">talent {activeRole ? `(${ROLE_OPTIONS.find(r => r.value === activeRole)?.label})` : 'semua role'}</span>
        </p>
        <Link href="/onboarding" className="text-xs text-accent hover:underline">
          + Daftar sebagai talent
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-surface border border-line rounded-xl p-4 h-20 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {talents.map((t, i) => (
            <Link key={t.id} href={`/talent/${t.username}`} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-4 hover:border-navy transition-colors block">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-navy to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {getInitials(t.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium">{t.full_name}</p>
                  {t.available && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">Open</span>}
                </div>
                <p className="text-xs text-muted">
                  {ROLE_OPTIONS.find(r => r.value === t.role)?.label}
                  {t.location ? ` · ${t.location}` : ''}
                  {t.skills.length > 0 ? ` · ${t.skills.slice(0, 2).join(', ')}` : ''}
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {getGradients(i).map((c, j) => (
                  <div key={j} className={`w-10 h-10 rounded-md bg-gradient-to-br ${c}`} />
                ))}
              </div>
              {t.rate_min && (
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-[10px] text-muted">Rate</p>
                  <p className="font-mono text-xs font-semibold">{(t.rate_min / 1000).toFixed(0)}K/jam</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
