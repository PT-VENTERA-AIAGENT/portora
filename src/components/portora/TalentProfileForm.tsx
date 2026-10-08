'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { saveTalentProfile } from '@/app/actions/talent'
import { INDUSTRIES, ROLE_LABELS, ROLE_OPTIONS, SKILLS, TOOLS } from '@/lib/portora/constants'
import { formatRate, isHttpUrl, normalizeUrl } from '@/lib/portora/format'
import { uploadImage } from '@/lib/portora/upload'
import type { PortfolioItemInput } from '@/lib/portora/validation'
import type { PortfolioLink, TalentRole } from '@/lib/supabase/types'
import TalentAvatar from './TalentAvatar'
import PortfolioTile from './PortfolioTile'

export interface TalentFormValues {
  full_name: string
  role: TalentRole | ''
  headline: string
  bio: string
  location: string
  experience_years: string
  rate_min: string
  rate_max: string
  skills: string[]
  tools: string[]
  industries: string[]
  portfolio_links: PortfolioLink[]
  available: boolean
  avatar_url: string | null
  whatsapp: string
  contact_email: string
}

const STEPS = ['Role', 'Skill & tools', 'Portfolio', 'Profil', 'Review']
const inputClass = 'w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-navy'
const inputStyle = { borderColor: '#E5E7EB' }
const toInt = (v: string) => (v.trim() === '' ? null : Math.max(0, Math.round(Number(v))))

// Isian karya yang belum ditambahkan; disimpan di induk agar tidak hilang saat pindah langkah.
export interface ItemDraft {
  kind: 'image' | 'video' | 'link'
  title: string
  description: string
  url: string
  media_url: string | null
}
export const EMPTY_ITEM_DRAFT: ItemDraft = { kind: 'image', title: '', description: '', url: '', media_url: null }
const isDraftEmpty = (d: ItemDraft) => !d.title.trim() && !d.description.trim() && !d.url.trim() && !d.media_url

function draftToItem(d: ItemDraft): { item: PortfolioItemInput } | { error: string } {
  const title = d.title.trim()
  if (title.length < 2) return { error: 'Judul karya minimal 2 karakter.' }
  if (d.kind === 'image') {
    if (!d.media_url) return { error: `Pilih file gambar untuk karya "${title}".` }
    return { item: { title, description: d.description, media_type: 'image', media_url: d.media_url, link_url: null } }
  }
  const url = normalizeUrl(d.url)
  if (!isHttpUrl(url)) return { error: `Link karya "${title}" belum valid. Contoh: https://youtube.com/watch?v=…` }
  return { item: { title, description: d.description, media_type: d.kind, media_url: null, link_url: url } }
}

// Error server berawalan label field -> langkah wizard yang memuat field itu.
const STEP_BY_FIELD: Record<string, number> = {
  Role: 0, Skill: 1, Tools: 1, Industri: 1, 'Link portfolio': 2, 'Judul karya': 2, Karya: 2, 'Link karya': 2,
}

interface Draft { version: 1; v: TalentFormValues; items: PortfolioItemInput[]; itemDraft: ItemDraft; step: number }

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="px-3 py-1.5 rounded-lg text-sm border transition-colors" style={{
      backgroundColor: active ? '#1A365D' : 'transparent',
      color: active ? '#FFFFFF' : '#0A0E1A',
      borderColor: active ? '#1A365D' : '#E5E7EB',
    }}>
      {children}
    </button>
  )
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0E1A' }}>
      {children}
      {hint && <span className="font-normal ml-1" style={{ color: '#6B7280' }}>{hint}</span>}
    </label>
  )
}

function TagPicker({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState('')
  const all = [...options, ...value.filter(v => !options.includes(v))]
  const toggle = (s: string) => onChange(value.includes(s) ? value.filter(x => x !== s) : [...value, s])
  function addCustom() {
    const v = custom.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setCustom('')
  }
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {all.map(s => <Chip key={s} active={value.includes(s)} onClick={() => toggle(s)}>{s}</Chip>)}
      </div>
      <div className="flex gap-2">
        <input value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          placeholder="Tambah lainnya…" maxLength={40} className={inputClass} style={inputStyle} />
        <button type="button" onClick={addCustom} className="border px-3 rounded-lg text-sm hover:opacity-80" style={inputStyle}>Tambah</button>
      </div>
    </div>
  )
}

export default function TalentProfileForm({ mode, initial, storageKey }: { mode: 'create' | 'edit'; initial: TalentFormValues; storageKey?: string }) {
  const router = useRouter()
  const [v, setV] = useState<TalentFormValues>(initial)
  const [items, setItems] = useState<PortfolioItemInput[]>([])
  const [itemDraft, setItemDraft] = useState<ItemDraft>(EMPTY_ITEM_DRAFT)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [restored, setRestored] = useState(false)
  const [saving, startSaving] = useTransition()
  // Simpan otomatis baru aktif setelah draf lama dibaca (aman untuk StrictMode yang menjalankan effect 2x).
  const [ready, setReady] = useState(false)

  // Pulihkan draf onboarding (refresh / tab tertutup) dari localStorage.
  useEffect(() => {
    if (storageKey) {
      try {
        const raw = localStorage.getItem(storageKey)
        const draft = raw ? (JSON.parse(raw) as Draft) : null
        if (draft?.version === 1) {
          setV({ ...initial, ...draft.v })
          setItems(draft.items ?? [])
          setItemDraft(draft.itemDraft ?? EMPTY_ITEM_DRAFT)
          setStep(Math.min(Math.max(draft.step ?? 0, 0), STEPS.length - 1))
          setRestored(true)
        }
      } catch {}
    }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    if (!storageKey || !ready) return
    try {
      const draft: Draft = { version: 1, v, items, itemDraft, step }
      localStorage.setItem(storageKey, JSON.stringify(draft))
    } catch {}
  }, [storageKey, ready, v, items, itemDraft, step])

  function clearDraft() {
    if (!storageKey) return
    try { localStorage.removeItem(storageKey) } catch {}
  }

  function startOver() {
    clearDraft()
    setV(initial)
    setItems([])
    setItemDraft(EMPTY_ITEM_DRAFT)
    setStep(0)
    setError('')
    setRestored(false)
  }

  const normalizedLinks = () => v.portfolio_links.map(l => ({ ...l, url: normalizeUrl(l.url) }))

  const set = <K extends keyof TalentFormValues>(key: K, value: TalentFormValues[K]) => setV(prev => ({ ...prev, [key]: value }))
  const role = v.role || null

  function stepError(i: number): string | null {
    if (i === 0 && !v.role) return 'Pilih role utamamu.'
    if (i === 1 && v.skills.length === 0) return 'Pilih minimal 1 skill.'
    if (i === 2) {
      const bad = normalizedLinks().find(l => l.url && !isHttpUrl(l.url))
      if (bad) return `Link "${bad.url.replace(/^https:\/\//, '')}" belum valid. Contoh: https://behance.net/namamu`
      if (mode === 'create' && !isDraftEmpty(itemDraft)) {
        const result = draftToItem(itemDraft)
        if ('error' in result) return `${result.error} Lengkapi lalu klik "+ Tambah karya", atau kosongkan isiannya.`
      }
      if (mode === 'create' && v.portfolio_links.filter(l => l.url.trim()).length + items.length === 0 && isDraftEmpty(itemDraft)) {
        return 'Tambahkan minimal 1 karya atau link portfolio.'
      }
    }
    if (i === 3) {
      if (v.full_name.trim().length < 2) return 'Nama wajib diisi.'
      if (!v.whatsapp.trim()) return 'Nomor WhatsApp wajib diisi (hanya terlihat oleh recruiter yang undangannya kamu terima).'
    }
    return null
  }

  function next() {
    const err = stepError(step)
    setError(err ?? '')
    if (err) return
    if (step === 2) {
      set('portfolio_links', normalizedLinks())
      // Karya yang sudah lengkap tapi lupa diklik "+ Tambah karya" ikut ditambahkan.
      if (mode === 'create' && !isDraftEmpty(itemDraft)) {
        const result = draftToItem(itemDraft)
        if ('item' in result) {
          setItems(prev => [...prev, result.item])
          setItemDraft(EMPTY_ITEM_DRAFT)
          toast.success(`Karya "${result.item.title}" ditambahkan`)
        }
      }
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function submit() {
    for (let i = 0; i < 4; i++) {
      const err = stepError(i)
      if (err) { setError(err); if (mode === 'create') setStep(i); return }
    }
    setError('')
    startSaving(async () => {
      const result = await saveTalentProfile({
        full_name: v.full_name,
        role: v.role as TalentRole,
        headline: v.headline,
        bio: v.bio,
        location: v.location,
        experience_years: toInt(v.experience_years),
        rate_min: toInt(v.rate_min),
        rate_max: toInt(v.rate_max),
        skills: v.skills,
        tools: v.tools,
        industries: v.industries,
        portfolio_links: normalizedLinks().filter(l => l.url).map(l => ({ url: l.url, label: l.label?.trim() || null })),
        available: v.available,
        avatar_url: v.avatar_url,
        whatsapp: v.whatsapp,
        contact_email: v.contact_email,
      }, items)
      if (result.error) {
        setError(result.error)
        const target = STEP_BY_FIELD[result.error.split(':')[0]]
        if (mode === 'create') setStep(target ?? 3)
        return
      }
      if (mode === 'create') {
        clearDraft()
        router.push('/dashboard?welcome=1')
      } else {
        toast.success('Profil disimpan')
        router.refresh()
      }
    })
  }

  async function onAvatar(file: File | undefined) {
    if (!file) return
    setUploading(true)
    const result = await uploadImage('avatars', file)
    setUploading(false)
    if ('error' in result) { setError(result.error); return }
    set('avatar_url', result.url)
  }

  // ---------- sections ----------
  const roleSection = (
    <div>
      <h2 className="font-display text-2xl mb-1">Apa role utamamu?</h2>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Pilih role yang paling sesuai dengan pekerjaanmu.</p>
      <div className="space-y-3">
        {ROLE_OPTIONS.map(r => (
          <button type="button" key={r.value} onClick={() => setV(prev => ({ ...prev, role: r.value, ...(prev.role && prev.role !== r.value ? { skills: [], tools: [] } : {}) }))}
            className="w-full text-left border rounded-xl p-4 transition-colors" style={{
              borderWidth: v.role === r.value ? 2 : 1,
              borderColor: v.role === r.value ? '#1A365D' : '#E5E7EB',
              backgroundColor: v.role === r.value ? 'rgba(26,54,93,0.05)' : 'transparent',
            }}>
            <p className="font-medium text-sm">{r.label}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const skillsSection = (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-1">Skills & tools</h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>Pilih semua yang relevan. Recruiter memfilter dan menilai kecocokan dari sini.</p>
      </div>
      <TagPicker label="Skill" options={role ? SKILLS[role] : []} value={v.skills} onChange={x => set('skills', x)} />
      <TagPicker label="Tools" options={role ? TOOLS[role] : []} value={v.tools} onChange={x => set('tools', x)} />
      <TagPicker label="Pengalaman industri (opsional)" options={INDUSTRIES} value={v.industries} onChange={x => set('industries', x)} />
    </div>
  )

  const portfolioSection = (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-1">Portfolio</h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {mode === 'create'
            ? 'Unggah karya terbaikmu dan/atau tambahkan link (Behance, Drive, Instagram, YouTube, dll).'
            : 'Link portfolio. Karya yang diunggah dikelola dari dashboard.'}
        </p>
      </div>
      {mode === 'create' && <NewItemsEditor items={items} onChange={setItems} draft={itemDraft} onDraftChange={setItemDraft} onError={setError} />}
      <div>
        <Label>Link portfolio</Label>
        <div className="space-y-2">
          {v.portfolio_links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input type="url" value={link.url} placeholder="https://…" className={inputClass} style={inputStyle}
                onChange={e => set('portfolio_links', v.portfolio_links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))}
                onBlur={() => set('portfolio_links', v.portfolio_links.map((l, j) => (j === i ? { ...l, url: normalizeUrl(l.url) } : l)))} />
              <input value={link.label ?? ''} placeholder="Label (mis. Behance)" maxLength={80} className={`${inputClass} max-w-[40%]`} style={inputStyle}
                onChange={e => set('portfolio_links', v.portfolio_links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))} />
              <button type="button" aria-label="Hapus link" onClick={() => set('portfolio_links', v.portfolio_links.filter((_, j) => j !== i))}
                className="px-3 border rounded-lg text-sm hover:opacity-80" style={inputStyle}>×</button>
            </div>
          ))}
        </div>
        {v.portfolio_links.length < 10 && (
          <button type="button" onClick={() => set('portfolio_links', [...v.portfolio_links, { url: '', label: '' }])} className="text-xs hover:underline mt-2" style={{ color: '#1A365D' }}>
            + Tambah link
          </button>
        )}
      </div>
    </div>
  )

  const profileSection = (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl mb-1">Tentang kamu</h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>Info ini tampil di profil publikmu, kecuali kontak.</p>
      </div>
      <div className="flex items-center gap-4">
        <TalentAvatar name={v.full_name || '?'} url={v.avatar_url} size={64} rounded="rounded-xl" />
        <label className="text-sm font-medium cursor-pointer hover:underline" style={{ color: '#1A365D' }}>
          {uploading ? 'Mengunggah…' : v.avatar_url ? 'Ganti foto' : 'Unggah foto profil'}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploading} onChange={e => onAvatar(e.target.files?.[0])} />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Nama lengkap *</Label>
          <input value={v.full_name} onChange={e => set('full_name', e.target.value)} maxLength={80} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <Label>Lokasi</Label>
          <input value={v.location} onChange={e => set('location', e.target.value)} placeholder="Jakarta" maxLength={80} className={inputClass} style={inputStyle} />
        </div>
      </div>
      <div>
        <Label hint="(1 kalimat)">Headline</Label>
        <input value={v.headline} onChange={e => set('headline', e.target.value)} maxLength={120} placeholder="Mis. Designer branding untuk brand F&B dan beauty" className={inputClass} style={inputStyle} />
      </div>
      <div>
        <Label>Bio</Label>
        <textarea value={v.bio} onChange={e => set('bio', e.target.value)} rows={5} maxLength={1500}
          placeholder="Ceritakan pengalamanmu, spesialisasi, dan apa yang membuatmu unik sebagai creative talent..."
          className={`${inputClass} resize-none`} style={inputStyle} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label hint="(tahun)">Pengalaman</Label>
          <input type="number" min={0} max={50} value={v.experience_years} onChange={e => set('experience_years', e.target.value)} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <Label hint="(Rp/jam)">Tarif min</Label>
          <input type="number" min={0} step={5000} value={v.rate_min} onChange={e => set('rate_min', e.target.value)} placeholder="150000" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <Label hint="(Rp/jam)">Tarif maks</Label>
          <input type="number" min={0} step={5000} value={v.rate_max} onChange={e => set('rate_max', e.target.value)} placeholder="300000" className={inputClass} style={inputStyle} />
        </div>
      </div>
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input type="checkbox" checked={v.available} onChange={e => set('available', e.target.checked)} className="w-4 h-4 accent-[#0D9488]" />
        Open to work: saya sedang menerima proyek / pekerjaan baru
      </label>
      <div className="border-t pt-5" style={{ borderColor: '#E5E7EB' }}>
        <p className="text-sm font-medium mb-1">Kontak</p>
        <p className="text-xs mb-3" style={{ color: '#6B7280' }}>Privat. Hanya terlihat oleh recruiter yang undangannya kamu terima.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>WhatsApp *</Label>
            <input type="tel" value={v.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="08123456789" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <Label>Email kontak</Label>
            <input type="email" value={v.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="kamu@email.com" className={inputClass} style={inputStyle} />
          </div>
        </div>
      </div>
    </div>
  )

  const reviewSection = (
    <div>
      <h2 className="font-display text-2xl mb-1">Cek sekali lagi</h2>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Profilmu akan ditinjau tim Portora sebelum tampil di pencarian recruiter.</p>
      <div className="flex items-center gap-4 mb-5">
        <TalentAvatar name={v.full_name || '?'} url={v.avatar_url} size={56} rounded="rounded-xl" />
        <div>
          <p className="font-semibold">{v.full_name}</p>
          <p className="text-sm" style={{ color: '#6B7280' }}>{role ? ROLE_LABELS[role] : ''}{v.location ? ` · ${v.location}` : ''}</p>
        </div>
      </div>
      <dl className="text-sm space-y-2">
        {[
          ['Headline', v.headline || '—'],
          ['Skill', v.skills.join(', ') || '—'],
          ['Tools', v.tools.join(', ') || '—'],
          ['Karya diunggah', String(items.length)],
          ['Link portfolio', String(v.portfolio_links.filter(l => l.url.trim()).length)],
          ['Tarif', formatRate(toInt(v.rate_min), toInt(v.rate_max)) ?? '—'],
          ['WhatsApp', v.whatsapp || '—'],
        ].map(([k, val]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-32 flex-shrink-0" style={{ color: '#6B7280' }}>{k}</dt>
            <dd className="min-w-0 break-words">{val}</dd>
          </div>
        ))}
      </dl>
    </div>
  )

  const errorBox = error && (
    <div className="rounded-lg px-3 py-2 text-sm mb-4" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>
  )

  if (mode === 'edit') {
    return (
      <div className="space-y-6">
        {[roleSection, skillsSection, portfolioSection, profileSection].map((section, i) => (
          <div key={i} className="border rounded-2xl p-6 md:p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>{section}</div>
        ))}
        <div className="sticky bottom-4 border rounded-2xl p-4 flex items-center justify-between gap-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <div className="flex-1 min-w-0">{errorBox || <p className="text-xs" style={{ color: '#6B7280' }}>Perubahan pada profil yang ditolak akan dikirim ulang untuk review.</p>}</div>
          <button type="button" onClick={submit} disabled={saving || uploading} className="text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40 flex-shrink-0" style={{ backgroundColor: '#1A365D' }}>
            {saving ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>
        </div>
      </div>
    )
  }

  const sections = [roleSection, skillsSection, portfolioSection, profileSection, reviewSection]
  return (
    <div className="w-full max-w-xl">
      {restored && (
        <div className="rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between gap-4" style={{ backgroundColor: 'rgba(13,148,136,0.08)', color: '#0A0E1A' }}>
          <span>Isian sebelumnya dipulihkan. Lanjutkan dari langkah {step + 1}.</span>
          <button type="button" onClick={startOver} className="text-xs font-medium hover:underline flex-shrink-0" style={{ color: '#1A365D' }}>Mulai dari awal</button>
        </div>
      )}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{
              backgroundColor: i <= step ? '#1A365D' : 'transparent',
              color: i <= step ? '#FFFFFF' : '#6B7280',
              border: i <= step ? 'none' : '1px solid #E5E7EB',
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs hidden md:block ${i === step ? 'font-medium' : ''}`} style={{ color: i === step ? '#0A0E1A' : '#6B7280' }}>{s}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ backgroundColor: i < step ? '#1A365D' : '#E5E7EB' }} />}
          </div>
        ))}
      </div>

      <div className="border rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        {sections[step]}
        {storageKey && <p className="text-[11px] mt-6" style={{ color: '#6B7280' }}>Isian tersimpan otomatis di perangkat ini sampai profil dikirim.</p>}
        <div className="mt-4">
          {errorBox}
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => { setError(''); setStep(s => s - 1) }} className="flex-1 border py-3 rounded-lg text-sm transition-colors hover:opacity-80" style={inputStyle}>Kembali</button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} disabled={uploading} className="flex-1 text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: '#1A365D' }}>Lanjut</button>
            ) : (
              <button type="button" onClick={submit} disabled={saving} className="flex-1 text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: '#1A365D' }}>
                {saving ? 'Mengirim…' : 'Kirim untuk review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Karya baru saat onboarding (belum tersimpan ke DB sampai profil dikirim).
function NewItemsEditor({ items, onChange, draft, onDraftChange, onError }: {
  items: PortfolioItemInput[]
  onChange: (items: PortfolioItemInput[]) => void
  draft: ItemDraft
  onDraftChange: (d: ItemDraft) => void
  onError: (e: string) => void
}) {
  return (
    <div>
      <Label>Karya</Label>
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {items.map((item, i) => (
            <div key={i} className="relative">
              <PortfolioTile item={{ title: item.title, media_type: item.media_type, media_url: item.media_url ?? null, link_url: item.link_url ?? null }} />
              <button type="button" aria-label="Hapus karya" onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-xs text-white" style={{ backgroundColor: 'rgba(10,14,26,0.7)' }}>×</button>
            </div>
          ))}
        </div>
      )}
      {items.length < 12 && <PortfolioItemAdder draft={draft} onDraftChange={onDraftChange} onAdd={item => onChange([...items, item])} onError={onError} />}
    </div>
  )
}

export function PortfolioItemAdder({ draft, onDraftChange, onAdd, onError, busy }: {
  draft: ItemDraft
  onDraftChange: (d: ItemDraft) => void
  onAdd: (item: PortfolioItemInput) => void | Promise<void>
  onError: (e: string) => void
  busy?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [fileKey, setFileKey] = useState(0)
  const update = (patch: Partial<ItemDraft>) => onDraftChange({ ...draft, ...patch })

  // Gambar langsung diunggah saat dipilih, jadi tidak hilang saat pindah langkah.
  async function onFile(file: File | undefined) {
    if (!file) return
    onError('')
    setUploading(true)
    const result = await uploadImage('portfolio', file)
    setUploading(false)
    setFileKey(k => k + 1)
    if ('error' in result) { onError(result.error); return }
    update({ media_url: result.url, title: draft.title || file.name.replace(/\.[^.]+$/, '') })
  }

  async function add() {
    const result = draftToItem(draft)
    if ('error' in result) { onError(result.error); return }
    onError('')
    await onAdd(result.item)
    onDraftChange(EMPTY_ITEM_DRAFT)
  }

  return (
    <div className="border border-dashed rounded-xl p-4 space-y-3" style={{ borderColor: '#E5E7EB' }}>
      <div className="flex gap-2">
        {([['image', 'Gambar'], ['video', 'Video (link)'], ['link', 'Link']] as const).map(([k, label]) => (
          <Chip key={k} active={draft.kind === k} onClick={() => update({ kind: k })}>{label}</Chip>
        ))}
      </div>
      <input value={draft.title} onChange={e => update({ title: e.target.value })} maxLength={100} placeholder="Judul karya" className={inputClass} style={inputStyle} />
      {draft.kind === 'image' ? (
        <div className="flex items-center gap-3">
          {draft.media_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.media_url} alt="Pratinjau karya" className="w-14 h-14 rounded-lg object-cover border flex-shrink-0" style={{ borderColor: '#E5E7EB' }} />
          )}
          <label className="text-sm font-medium cursor-pointer border px-3 py-2 rounded-lg hover:opacity-80" style={{ borderColor: '#E5E7EB', color: '#1A365D' }}>
            {uploading ? 'Mengunggah…' : draft.media_url ? 'Ganti gambar' : 'Pilih gambar'}
            <input key={fileKey} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={uploading} onChange={e => onFile(e.target.files?.[0])} />
          </label>
          <span className="text-xs" style={{ color: '#6B7280' }}>PNG/JPG/WebP, maks 5 MB</span>
        </div>
      ) : (
        <input type="url" value={draft.url} onChange={e => update({ url: e.target.value })} onBlur={() => update({ url: normalizeUrl(draft.url) })}
          placeholder={draft.kind === 'video' ? 'https://youtube.com/… atau Google Drive' : 'https://…'} className={inputClass} style={inputStyle} />
      )}
      <input value={draft.description} onChange={e => update({ description: e.target.value })} maxLength={400} placeholder="Deskripsi singkat (opsional): klien, peran, hasil" className={inputClass} style={inputStyle} />
      <button type="button" onClick={add} disabled={uploading || busy} className="text-sm font-medium border px-4 py-2 rounded-lg hover:opacity-80 disabled:opacity-40" style={{ borderColor: '#1A365D', color: '#1A365D' }}>
        {uploading ? 'Mengunggah…' : busy ? 'Menyimpan…' : '+ Tambah karya'}
      </button>
    </div>
  )
}
