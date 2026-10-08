import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FitScoreCard from '@/components/portora/FitScoreCard'
import InviteButton from '@/components/portora/InviteButton'
import PortfolioTile from '@/components/portora/PortfolioTile'
import SaveButton from '@/components/portora/SaveButton'
import StatusBadge from '@/components/portora/StatusBadge'
import TalentAvatar from '@/components/portora/TalentAvatar'
import UpgradeNote from '@/components/portora/UpgradeNote'
import { ROLE_LABELS } from '@/lib/portora/constants'
import { computeFitScore } from '@/lib/portora/fit-score'
import { formatDate, formatRate, waNumber } from '@/lib/portora/format'
import { effectivePlan, isGrowth, STARTER_LIMITS } from '@/lib/portora/plan'
import { getOwnRecruiterProfile, getViewer } from '@/lib/portora/session'
import type { Invite, PortfolioItem, TalentContact, TalentProfile } from '@/lib/supabase/types'

interface PageProps {
  params: Promise<{ username: string }>
}

const card = 'border rounded-2xl p-6'
const cardStyle = { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }

async function loadProfile(username: string) {
  const { supabase } = await getViewer()
  const { data } = await supabase.from('portora_talent_profiles').select('*').eq('username', username).maybeSingle()
  return data as TalentProfile | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const profile = await loadProfile(username)
  if (!profile || profile.status !== 'approved' || !profile.is_public) return { title: 'Talent', robots: { index: false } }
  return {
    title: `${profile.full_name} — ${ROLE_LABELS[profile.role]}`,
    description: profile.headline ?? profile.bio?.slice(0, 150) ?? undefined,
  }
}

export default async function TalentProfilePage({ params }: PageProps) {
  const { username } = await params
  const { supabase, user, role, isAdmin } = await getViewer()
  const profile = await loadProfile(username)
  if (!profile) notFound()

  const isOwner = !!user && user.id === profile.user_id
  const isPublic = profile.status === 'approved' && profile.is_public
  if (!isPublic && !isOwner && !isAdmin) notFound()

  const isRecruiter = role === 'recruiter'
  const company = isRecruiter ? await getOwnRecruiterProfile() : null
  const growth = isRecruiter && !!company && isGrowth(effectivePlan(company).plan)

  const { data: itemRows } = await supabase
    .from('portora_portfolio_items')
    .select('*')
    .eq('talent_profile_id', profile.id)
    .order('sort_order', { ascending: true })
  const items = (itemRows ?? []) as PortfolioItem[]

  let saved = false
  let latestInvite: Invite | null = null
  let contact: Pick<TalentContact, 'whatsapp' | 'email'> | null = null
  if (isRecruiter && user && company) {
    const [{ data: entry }, { data: invites }] = await Promise.all([
      supabase.from('portora_shortlists').select('id').eq('recruiter_user_id', user.id).eq('talent_profile_id', profile.id).maybeSingle(),
      supabase.from('portora_invites').select('*').eq('recruiter_user_id', user.id).eq('talent_profile_id', profile.id).order('created_at', { ascending: false }),
    ])
    saved = !!entry
    const list = (invites ?? []) as Invite[]
    latestInvite = list[0] ?? null
    // Kontak hanya diambil bila ada undangan yang diterima (RLS juga membatasi ini di DB).
    if (list.some(i => i.status === 'accepted')) {
      const { data } = await supabase.from('portora_talent_contacts').select('whatsapp, email').eq('talent_profile_id', profile.id).maybeSingle()
      contact = data
    }
  }

  const fullAccess = isOwner || isAdmin || growth
  const visibleItems = fullAccess ? items : items.slice(0, STARTER_LIMITS.portfolioPreview)
  const hiddenCount = items.length - visibleItems.length
  const fit = computeFitScore(profile, items.length)
  const rate = formatRate(profile.rate_min, profile.rate_max)
  const links = profile.portfolio_links ?? []
  const wa = waNumber(contact?.whatsapp ?? null)
  const backHref = isRecruiter ? '/discover' : isOwner ? '/dashboard' : '/'
  const backLabel = isRecruiter ? 'Kembali ke Discover' : isOwner ? 'Kembali ke Dashboard' : 'Beranda'

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href={backHref} className="text-xs font-mono flex items-center gap-1 hover:underline" style={{ color: '#6B7280' }}>
          ← {backLabel}
        </Link>
      </div>

      {isOwner && !isPublic && (
        <div className="rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between gap-4" style={{ backgroundColor: 'rgba(217,119,6,0.08)', color: '#0A0E1A' }}>
          <span>
            {profile.status === 'pending' && 'Pratinjau: profil ini belum tampil untuk recruiter karena masih ditinjau.'}
            {profile.status === 'rejected' && `Pratinjau: profil perlu perbaikan. ${profile.rejection_reason ?? ''}`}
            {profile.status === 'approved' && 'Pratinjau: profil disembunyikan dari publik.'}
          </span>
          <Link href="/dashboard/profile" className="font-medium hover:underline flex-shrink-0" style={{ color: '#1A365D' }}>Edit profil</Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <aside className="md:col-span-1">
          <div className="border rounded-2xl p-6 sticky top-24" style={cardStyle}>
            <div className="mb-4">
              <TalentAvatar name={profile.full_name} url={profile.avatar_url} size={80} rounded="rounded-xl" />
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h1 className="text-xl font-semibold">{profile.full_name}</h1>
              {profile.featured && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#D97706' }}>Featured</span>}
            </div>
            <p className="text-sm mb-1" style={{ color: '#6B7280' }}>{ROLE_LABELS[profile.role]}</p>
            {profile.location && <p className="text-xs font-mono mb-4" style={{ color: '#6B7280' }}>{profile.location}</p>}
            {(isOwner || isAdmin) && <div className="mb-4"><StatusBadge status={profile.status} /></div>}
            {profile.available && (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium mb-4" style={{ backgroundColor: 'rgba(13,148,136,0.1)', color: '#0D9488' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#0D9488' }} />
                Open to work
              </div>
            )}
            {rate && <p className="text-xs font-mono mb-1" style={{ color: '#6B7280' }}>{rate}</p>}
            {profile.experience_years != null && <p className="text-xs font-mono mb-4" style={{ color: '#6B7280' }}>{profile.experience_years} tahun pengalaman</p>}
            {(profile.skills.length > 0 || profile.tools.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mb-6 mt-3">
                {[...profile.skills, ...profile.tools].map(s => (
                  <span key={s} className="text-[11px] border rounded-md px-2 py-0.5" style={{ borderColor: '#E5E7EB', backgroundColor: '#F3F4F6', color: '#6B7280' }}>{s}</span>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {isOwner && (
                <Link href="/dashboard/profile" className="w-full block text-center text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>Edit profil</Link>
              )}
              {isRecruiter && !company && (
                <Link href="/company" className="w-full block text-center text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>Lengkapi profil perusahaan</Link>
              )}
              {isRecruiter && company && isPublic && (
                <>
                  {contact ? (
                    <div className="rounded-xl p-3 text-sm space-y-2" style={{ backgroundColor: 'rgba(13,148,136,0.06)' }}>
                      <p className="text-xs font-medium" style={{ color: '#0D9488' }}>Undangan diterima, kontak terbuka</p>
                      {wa && (
                        <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${profile.full_name}, saya dari ${company.company_name} (via Portora.id).`)}`} target="_blank" rel="noopener noreferrer"
                          className="w-full block text-center text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#0D9488' }}>
                          Chat WhatsApp
                        </a>
                      )}
                      {contact.email && <a href={`mailto:${contact.email}`} className="block text-center text-xs hover:underline" style={{ color: '#1A365D' }}>{contact.email}</a>}
                    </div>
                  ) : latestInvite?.status === 'sent' ? (
                    <p className="text-xs rounded-xl p-3" style={{ backgroundColor: 'rgba(217,119,6,0.08)', color: '#0A0E1A' }}>
                      Undangan &ldquo;{latestInvite.project_title}&rdquo; terkirim {formatDate(latestInvite.created_at)}. Menunggu jawaban talent.
                    </p>
                  ) : (
                    <>
                      {latestInvite?.status === 'declined' && <p className="text-xs" style={{ color: '#6B7280' }}>Undangan sebelumnya ditolak. Kamu bisa mengirim undangan baru.</p>}
                      <InviteButton talentId={profile.id} talentName={profile.full_name} />
                    </>
                  )}
                  <SaveButton talentId={profile.id} initialSaved={saved} variant="full" />
                </>
              )}
              {!user && (
                <>
                  <Link href={`/login?next=/talent/${profile.username}`} className="w-full block text-center text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>
                    Login untuk menghubungi
                  </Link>
                  <p className="text-xs text-center" style={{ color: '#6B7280' }}>
                    Recruiter? <Link href="/register?role=recruiter" className="hover:underline" style={{ color: '#1A365D' }}>Coba gratis 14 hari</Link>
                  </p>
                </>
              )}
              {isAdmin && <Link href="/admin" className="block text-center text-xs hover:underline" style={{ color: '#1A365D' }}>Buka panel admin</Link>}
            </div>
          </div>
        </aside>

        <div className="md:col-span-2 space-y-6">
          {profile.ai_summary && (isRecruiter || isOwner || isAdmin) && (
            <div className={card} style={cardStyle}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-semibold">Ringkasan AI</h2>
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#6B7280' }}>dibuat {formatDate(profile.ai_summary_at)}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#0A0E1A' }}>{profile.ai_summary}</p>
            </div>
          )}

          {(profile.headline || profile.bio || profile.industries.length > 0) && (
            <div className={card} style={cardStyle}>
              <h2 className="font-semibold mb-3">Tentang</h2>
              {profile.headline && <p className="text-sm font-medium mb-2">{profile.headline}</p>}
              {profile.bio && <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#6B7280' }}>{profile.bio}</p>}
              {profile.industries.length > 0 && (
                <p className="text-xs mt-3" style={{ color: '#6B7280' }}>Industri: <span style={{ color: '#0A0E1A' }}>{profile.industries.join(', ')}</span></p>
              )}
            </div>
          )}

          <div className={card} style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Portfolio</h2>
              <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{items.length} karya</span>
            </div>
            {items.length === 0 ? (
              <p className="text-sm" style={{ color: '#6B7280' }}>Belum ada karya yang diunggah{links.length ? '. Lihat link portfolio di bawah.' : '.'}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {visibleItems.map(item => <PortfolioTile key={item.id} item={item} />)}
                {hiddenCount > 0 && (
                  <Link href={user ? '/company#paket' : `/login?next=/talent/${profile.username}`} className="aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center text-center p-3 hover:border-navy" style={{ borderColor: '#E5E7EB' }}>
                    <span className="font-mono text-lg font-semibold" style={{ color: '#1A365D' }}>+{hiddenCount}</span>
                    <span className="text-xs" style={{ color: '#6B7280' }}>{user ? 'karya lain di paket Growth' : 'Login sebagai recruiter untuk melihat semua'}</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {links.length > 0 && (
            <div className={card} style={cardStyle}>
              <h2 className="font-semibold mb-4">Link portfolio</h2>
              <div className="space-y-2">
                {links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline" style={{ color: '#1A365D' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {link.label || link.url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {(growth || isOwner || isAdmin) && <FitScoreCard fit={fit} />}
          {isRecruiter && company && !growth && (
            <UpgradeNote title="Fit score per template role" desc="Lihat seberapa cocok talent ini dengan template role, lengkap dengan rincian skill, tools, dan bukti karya." />
          )}
        </div>
      </div>
    </main>
  )
}
