import Link from 'next/link'
import { redirect } from 'next/navigation'
import StatusBadge from '@/components/portora/StatusBadge'
import TalentAvatar from '@/components/portora/TalentAvatar'
import { ROLE_LABELS } from '@/lib/portora/constants'
import { formatDate, waNumber } from '@/lib/portora/format'
import { getOwnTalentProfile, getViewer } from '@/lib/portora/session'
import type { Invite, PortfolioItem, RecruiterProfile } from '@/lib/supabase/types'
import { AvailabilityToggle, InviteActions, PortfolioManager, VisibilityToggle } from './DashboardClient'

const card = 'border rounded-2xl p-6'
const cardStyle = { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams
  const { supabase } = await getViewer()
  const profile = await getOwnTalentProfile()
  if (!profile) redirect('/onboarding')

  const [{ data: itemRows }, { data: inviteRows }, { data: contact }] = await Promise.all([
    supabase.from('portora_portfolio_items').select('*').eq('talent_profile_id', profile.id).order('sort_order', { ascending: true }),
    supabase.from('portora_invites').select('*').eq('talent_profile_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('portora_talent_contacts').select('whatsapp').eq('talent_profile_id', profile.id).maybeSingle(),
  ])
  const items = (itemRows ?? []) as PortfolioItem[]
  const invites = (inviteRows ?? []) as Invite[]

  const recruiterIds = [...new Set(invites.map(i => i.recruiter_user_id))]
  const { data: companyRows } = recruiterIds.length
    ? await supabase.from('portora_recruiter_profiles').select('*').in('user_id', recruiterIds)
    : { data: [] }
  const companies = new Map(((companyRows ?? []) as RecruiterProfile[]).map(c => [c.user_id, c]))

  const checklist = [
    { label: 'Foto profil', done: !!profile.avatar_url },
    { label: 'Headline', done: !!profile.headline },
    { label: 'Bio minimal 2 kalimat', done: (profile.bio ?? '').trim().length >= 80 },
    { label: 'Minimal 3 karya diunggah', done: items.length >= 3 },
    { label: 'Tarif per jam', done: !!profile.rate_min },
    { label: 'Nomor WhatsApp', done: !!contact?.whatsapp },
  ]
  const completeness = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100)
  const pendingInvites = invites.filter(i => i.status === 'sent').length

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <TalentAvatar name={profile.full_name} url={profile.avatar_url} size={56} rounded="rounded-xl" />
          <div>
            <div className="flex items-center gap-2 text-xs mb-1 font-mono" style={{ color: '#6B7280' }}>
              <span>Talent</span><span>/</span><span style={{ color: '#0A0E1A' }}>Dashboard</span>
            </div>
            <h1 className="text-3xl font-display tracking-tight">Halo, {profile.full_name.split(' ')[0]}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/profile" className="border px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>Edit profil</Link>
          <Link href={`/talent/${profile.username}`} className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>Lihat profil publik</Link>
        </div>
      </div>

      {welcome && (
        <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ backgroundColor: 'rgba(13,148,136,0.08)', color: '#0D9488' }}>
          Profil terkirim! Tim Portora akan meninjaunya sebelum profilmu tampil di pencarian recruiter.
        </div>
      )}

      <div className={`${card} mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4`} style={cardStyle}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold">Status profil</p>
            <StatusBadge status={profile.status} />
          </div>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {profile.status === 'pending' && 'Profilmu sedang ditinjau tim Portora. Setelah disetujui, profilmu tampil di pencarian recruiter.'}
            {profile.status === 'approved' && `Profilmu tampil di pencarian recruiter sebagai ${ROLE_LABELS[profile.role]}.`}
            {profile.status === 'rejected' && (
              <>Catatan reviewer: <span style={{ color: '#0A0E1A' }}>{profile.rejection_reason}</span>. Perbaiki profil, dan perubahan akan dikirim ulang untuk review.</>
            )}
          </p>
        </div>
        {profile.status === 'rejected' && (
          <Link href="/dashboard/profile" className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex-shrink-0" style={{ backgroundColor: '#1A365D' }}>Perbaiki profil</Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className={card} style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Undangan dari recruiter</h2>
              {pendingInvites > 0 && <span className="text-xs font-mono" style={{ color: '#D97706' }}>{pendingInvites} menunggu jawaban</span>}
            </div>
            {invites.length === 0 ? (
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Belum ada undangan. Recruiter bisa mengundangmu setelah profilmu disetujui. Lengkapi profil supaya lebih mudah ditemukan.
              </p>
            ) : (
              <div className="space-y-3">
                {invites.map(invite => {
                  const company = companies.get(invite.recruiter_user_id)
                  const wa = waNumber(company?.contact_whatsapp ?? null)
                  return (
                    <div key={invite.id} className="border rounded-xl p-4" style={{ borderColor: '#E5E7EB' }}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium">{invite.project_title}</p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>
                            {company?.company_name ?? 'Recruiter'}{company?.industry ? ` · ${company.industry}` : ''} · {formatDate(invite.created_at)}
                          </p>
                        </div>
                        <StatusBadge status={invite.status} />
                      </div>
                      {invite.message && <p className="text-sm mb-2 whitespace-pre-line" style={{ color: '#0A0E1A' }}>{invite.message}</p>}
                      {invite.budget && <p className="text-xs font-mono mb-3" style={{ color: '#6B7280' }}>Budget: {invite.budget}</p>}
                      {invite.status === 'sent' && <InviteActions inviteId={invite.id} />}
                      {invite.status === 'accepted' && (
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          Kontakmu sudah terbuka untuk recruiter ini.
                          {wa && <> Hubungi mereka: <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#0D9488' }}>WhatsApp {company?.contact_name ?? ''}</a></>}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className={card} style={cardStyle}>
            <h2 className="font-semibold mb-4">Karya portfolio</h2>
            <PortfolioManager items={items} />
          </section>
        </div>

        <aside className="space-y-6">
          <section className={`${card} space-y-5`} style={cardStyle}>
            <AvailabilityToggle initial={profile.available} />
            <div className="border-t" style={{ borderColor: '#E5E7EB' }} />
            <VisibilityToggle initial={profile.is_public} />
          </section>
          <section className={card} style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Kelengkapan profil</h2>
              <span className="font-mono text-sm font-semibold" style={{ color: completeness === 100 ? '#0D9488' : '#1A365D' }}>{completeness}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="h-full rounded-full" style={{ width: `${completeness}%`, backgroundColor: '#0D9488' }} />
            </div>
            <ul className="space-y-2">
              {checklist.map(c => (
                <li key={c.label} className="flex items-center gap-2 text-sm" style={{ color: c.done ? '#0A0E1A' : '#6B7280' }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0" style={{ backgroundColor: c.done ? '#0D9488' : '#E5E7EB' }}>{c.done ? '✓' : ''}</span>
                  {c.label}
                </li>
              ))}
            </ul>
          </section>
          <section className={card} style={cardStyle}>
            <h2 className="font-semibold mb-3">Ringkasan</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs" style={{ color: '#6B7280' }}>Undangan</dt><dd className="font-mono text-lg font-semibold">{invites.length}</dd></div>
              <div><dt className="text-xs" style={{ color: '#6B7280' }}>Diterima</dt><dd className="font-mono text-lg font-semibold">{invites.filter(i => i.status === 'accepted').length}</dd></div>
              <div><dt className="text-xs" style={{ color: '#6B7280' }}>Karya</dt><dd className="font-mono text-lg font-semibold">{items.length}</dd></div>
              <div><dt className="text-xs" style={{ color: '#6B7280' }}>Link</dt><dd className="font-mono text-lg font-semibold">{(profile.portfolio_links ?? []).length}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  )
}
