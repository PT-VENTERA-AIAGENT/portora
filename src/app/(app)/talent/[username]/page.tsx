import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const ROLE_LABELS: Record<string, string> = {
  'graphic-designer': 'Graphic Designer',
  'video-editor': 'Video Editor',
  'content-creative': 'Social Media Creative',
}

const PORTFOLIO_COLORS = [
  'from-rose-400 to-purple-500',
  'from-amber-400 to-red-500',
  'from-teal-400 to-emerald-600',
  'from-blue-400 to-indigo-500',
  'from-pink-400 to-rose-500',
  'from-green-400 to-teal-500',
]

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function TalentProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: talent } = await supabase
    .from('portora_talent_profiles')
    .select('*')
    .eq('username', username)
    .eq('is_public', true)
    .maybeSingle()

  // Graceful fallback for demo/empty DB
  const profile = talent ?? {
    id: 'demo',
    user_id: '',
    username,
    full_name: username.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    role: 'graphic-designer',
    location: 'Indonesia',
    bio: 'Creative professional di Indonesia.',
    skills: ['Design', 'Creative'],
    tools: ['Figma', 'Illustrator'],
    available: true,
    rate_min: null,
    rate_max: null,
    portfolio_links: [] as { url: string; label?: string }[],
    is_public: true,
    created_at: '',
  }

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const skills: string[] = profile.skills ?? []
  const tools: string[] = profile.tools ?? []
  const portfolioLinks: { url: string; label?: string }[] = profile.portfolio_links ?? []

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/discover" className="text-xs font-mono flex items-center gap-1 hover:underline" style={{ color: '#6B7280' }}>
          ← Kembali ke Discover
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <aside className="md:col-span-1">
          <div className="border rounded-2xl p-6 sticky top-24" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4" style={{ background: 'linear-gradient(to bottom right, #1A365D, #0D9488)' }}>
              {initials}
            </div>
            <h1 className="text-xl font-semibold mb-0.5">{profile.full_name}</h1>
            <p className="text-sm mb-1" style={{ color: '#6B7280' }}>
              {ROLE_LABELS[profile.role] ?? profile.role}
            </p>
            {profile.location && (
              <p className="text-xs font-mono mb-4" style={{ color: '#6B7280' }}>{profile.location}</p>
            )}
            {profile.available && (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium mb-4" style={{ backgroundColor: 'rgba(13,148,136,0.1)', color: '#0D9488' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#0D9488' }} />
                Open to work
              </div>
            )}
            {profile.rate_min && (
              <p className="text-xs font-mono mb-4" style={{ color: '#6B7280' }}>
                Rp {(profile.rate_min / 1000).toFixed(0)}K–{(profile.rate_max ? profile.rate_max / 1000 : profile.rate_min / 1000 * 2).toFixed(0)}K / jam
              </p>
            )}
            {(skills.length > 0 || tools.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {skills.map((s: string) => (
                  <span key={s} className="text-[11px] border rounded-md px-2 py-0.5" style={{ borderColor: '#E5E7EB', backgroundColor: '#F3F4F6', color: '#6B7280' }}>{s}</span>
                ))}
                {tools.map((t: string) => (
                  <span key={t} className="text-[11px] border rounded-md px-2 py-0.5" style={{ borderColor: '#E5E7EB', backgroundColor: '#F3F4F6', color: '#6B7280' }}>{t}</span>
                ))}
              </div>
            )}
            <a
              href={`https://wa.me/?text=Halo ${encodeURIComponent(profile.full_name)}, saya tertarik dengan portfolio kamu di Portora.id`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1A365D' }}
            >
              Hubungi talent
            </a>
          </div>
        </aside>

        <div className="md:col-span-2 space-y-6">
          {profile.bio && (
            <div className="border rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <h2 className="font-semibold mb-3">Tentang</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{profile.bio}</p>
            </div>
          )}

          {portfolioLinks.length > 0 && (
            <div className="border rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <h2 className="font-semibold mb-4">Portfolio Links</h2>
              <div className="space-y-2">
                {portfolioLinks.map((link: { url: string; label?: string }, i: number) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline" style={{ color: '#1A365D' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {link.label || link.url}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
            <h2 className="font-semibold mb-4">Portfolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PORTFOLIO_COLORS.map((c, i) => (
                <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${c} flex items-end p-2`}>
                  <span className="text-white text-[10px] font-medium opacity-80">Karya {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
