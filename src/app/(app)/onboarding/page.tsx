'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const STEPS = ['Role', 'Skills', 'Portfolio', 'Bio']
const ROLES = ['Graphic Designer', 'Video Editor', 'Social Media Creative'] as const
const ROLE_SLUG_MAP: Record<string, 'graphic-designer' | 'video-editor' | 'content-creative'> = {
  'Graphic Designer': 'graphic-designer',
  'Video Editor': 'video-editor',
  'Social Media Creative': 'content-creative',
}
const SKILLS: Record<string, string[]> = {
  'Graphic Designer': ['Adobe Illustrator', 'Figma', 'Photoshop', 'Branding', 'Typography', 'Social Media Design', 'Motion Graphics'],
  'Video Editor': ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Color Grading', 'Motion Graphics', 'Sound Design', 'Reels/Short'],
  'Social Media Creative': ['Canva', 'Figma', 'Copywriting', 'Content Strategy', 'Reels', 'Feed Curation', 'Brand Voice'],
}

function generateUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [portfolioLinks, setPortfolioLinks] = useState(['', ''])
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleSave() {
    setSaving(true)
    setSaveError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const fullName = (user.user_metadata?.full_name as string) ?? user.email ?? 'user'
    let username = generateUsername(fullName)

    // Check uniqueness; append random suffix if taken
    const { data: existing } = await supabase
      .from('portora_talent_profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      username = `${username}-${Math.floor(Math.random() * 9000 + 1000)}`
    }

    const filtered = portfolioLinks.filter(l => l.trim() !== '')

    const { error } = await supabase.from('portora_talent_profiles').insert({
      user_id: user.id,
      username,
      full_name: fullName,
      bio,
      skills: selectedSkills,
      tools: [],
      portfolio_links: filtered.map(url => ({ url, label: url })),
      role: ROLE_SLUG_MAP[role] ?? 'graphic-designer',
      available: true,
      is_public: true,
    })

    if (error) {
      setSaveError(error.message)
      setSaving(false)
      return
    }

    router.push(`/talent/${username}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#FAFAF7' }}>
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium" style={{
                backgroundColor: i <= step ? '#1A365D' : 'transparent',
                color: i <= step ? '#FFFFFF' : '#6B7280',
                border: i <= step ? 'none' : '1px solid #E5E7EB',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'font-medium' : ''}`} style={{ color: i === step ? '#0A0E1A' : '#6B7280' }}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ backgroundColor: i < step ? '#1A365D' : '#E5E7EB' }} />}
            </div>
          ))}
        </div>

        <div className="border rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl mb-1">Apa role utamamu?</h2>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Pilih role yang paling sesuai dengan pekerjaanmu.</p>
              <div className="space-y-3">
                {ROLES.map(r => (
                  <button key={r} onClick={() => setRole(r)} className="w-full text-left border rounded-xl p-4 transition-colors" style={{
                    borderWidth: role === r ? 2 : 1,
                    borderColor: role === r ? '#1A365D' : '#E5E7EB',
                    backgroundColor: role === r ? 'rgba(26,54,93,0.05)' : 'transparent',
                  }}>
                    <p className="font-medium text-sm">{r}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => role && setStep(1)} disabled={!role} className="mt-6 w-full text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: '#1A365D' }}>
                Lanjut
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl mb-1">Skills & tools</h2>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Pilih skill yang kamu kuasai (pilih semua yang relevan).</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {(SKILLS[role] ?? []).map(s => (
                  <button key={s} onClick={() => setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    className="px-3 py-1.5 rounded-lg text-sm border transition-colors" style={{
                      backgroundColor: selectedSkills.includes(s) ? '#1A365D' : 'transparent',
                      color: selectedSkills.includes(s) ? '#FFFFFF' : '#0A0E1A',
                      borderColor: selectedSkills.includes(s) ? '#1A365D' : '#E5E7EB',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="flex-1 border py-3 rounded-lg text-sm transition-colors hover:opacity-80" style={{ borderColor: '#E5E7EB' }}>Kembali</button>
                <button onClick={() => setStep(2)} className="flex-1 text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>Lanjut</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl mb-1">Link portfolio</h2>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Tambahkan link portfolio terbaikmu (Behance, Drive, Instagram, dll).</p>
              <div className="space-y-3 mb-6">
                {portfolioLinks.map((link, i) => (
                  <input key={i} type="url" value={link} onChange={e => setPortfolioLinks(prev => prev.map((l, j) => j === i ? e.target.value : l))}
                    placeholder={`Portfolio link ${i + 1} (https://...)`}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: '#E5E7EB' }} />
                ))}
                <button onClick={() => setPortfolioLinks(prev => [...prev, ''])} className="text-xs hover:underline" style={{ color: '#1A365D' }}>+ Tambah link</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 border py-3 rounded-lg text-sm transition-colors hover:opacity-80" style={{ borderColor: '#E5E7EB' }}>Kembali</button>
                <button onClick={() => setStep(3)} className="flex-1 text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>Lanjut</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl mb-1">Tentang kamu</h2>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Tulis bio singkat yang akan tampil di profilemu.</p>
              {saveError && (
                <div className="rounded-lg px-3 py-2 text-sm mb-4" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
                  {saveError}
                </div>
              )}
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5}
                placeholder="Ceritakan pengalamanmu, spesialisasi, dan apa yang membuatmu unik sebagai creative talent..."
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none mb-6" style={{ borderColor: '#E5E7EB' }} />
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 border py-3 rounded-lg text-sm transition-colors hover:opacity-80" style={{ borderColor: '#E5E7EB' }}>Kembali</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: '#1A365D' }}>
                  {saving ? 'Menyimpan...' : 'Buat profile'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
