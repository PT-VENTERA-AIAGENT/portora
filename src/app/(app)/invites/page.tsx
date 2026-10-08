import Link from 'next/link'
import { redirect } from 'next/navigation'
import StatusBadge from '@/components/portora/StatusBadge'
import TalentAvatar from '@/components/portora/TalentAvatar'
import { ROLE_LABELS } from '@/lib/portora/constants'
import { formatDate, waNumber } from '@/lib/portora/format'
import { getOwnRecruiterProfile, getViewer } from '@/lib/portora/session'
import type { Invite, TalentContact, TalentProfile } from '@/lib/supabase/types'

export const metadata = { title: 'Undangan' }

export default async function InvitesPage() {
  const { supabase, user } = await getViewer()
  if (!user) redirect('/login?next=/invites')
  const company = await getOwnRecruiterProfile()
  if (!company) redirect('/company')

  const { data: inviteRows } = await supabase
    .from('portora_invites')
    .select('*')
    .eq('recruiter_user_id', user.id)
    .order('created_at', { ascending: false })
  const invites = (inviteRows ?? []) as Invite[]
  const talentIds = [...new Set(invites.map(i => i.talent_profile_id))]
  const acceptedIds = [...new Set(invites.filter(i => i.status === 'accepted').map(i => i.talent_profile_id))]

  const [{ data: talentRows }, { data: contactRows }] = await Promise.all([
    talentIds.length ? supabase.from('portora_talent_profiles').select('*').in('id', talentIds) : Promise.resolve({ data: [] }),
    acceptedIds.length ? supabase.from('portora_talent_contacts').select('*').in('talent_profile_id', acceptedIds) : Promise.resolve({ data: [] }),
  ])
  const talents = new Map(((talentRows ?? []) as TalentProfile[]).map(t => [t.id, t]))
  const contacts = new Map(((contactRows ?? []) as TalentContact[]).map(c => [c.talent_profile_id, c]))

  const counts = {
    sent: invites.filter(i => i.status === 'sent').length,
    accepted: invites.filter(i => i.status === 'accepted').length,
    declined: invites.filter(i => i.status === 'declined').length,
  }

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs mb-2 font-mono" style={{ color: '#6B7280' }}>
          <span>Workspace</span><span>/</span><span style={{ color: '#0A0E1A' }}>Undangan</span>
        </div>
        <h1 className="text-3xl font-display tracking-tight">Undangan terkirim</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          {counts.sent} menunggu · {counts.accepted} diterima · {counts.declined} ditolak. Kontak talent terbuka setelah undangan diterima.
        </p>
      </div>

      {invites.length === 0 ? (
        <div className="border rounded-2xl p-10 text-center" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <p className="font-medium mb-1">Belum ada undangan</p>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Buka profil talent lalu klik &ldquo;Kirim undangan&rdquo;.</p>
          <Link href="/discover" className="inline-block text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>Cari talent</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map(invite => {
            const talent = talents.get(invite.talent_profile_id)
            const contact = invite.status === 'accepted' ? contacts.get(invite.talent_profile_id) : undefined
            const wa = waNumber(contact?.whatsapp ?? null)
            return (
              <div key={invite.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
                <div className="flex items-center gap-3 md:w-64 flex-shrink-0">
                  <TalentAvatar name={talent?.full_name ?? '?'} url={talent?.avatar_url ?? null} size={40} />
                  <div className="min-w-0">
                    {talent ? (
                      <Link href={`/talent/${talent.username}`} className="font-medium hover:underline truncate block">{talent.full_name}</Link>
                    ) : (
                      <p className="font-medium" style={{ color: '#6B7280' }}>Profil tidak tersedia</p>
                    )}
                    <p className="text-xs" style={{ color: '#6B7280' }}>{talent ? ROLE_LABELS[talent.role] : ''}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{invite.project_title}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    Dikirim {formatDate(invite.created_at)}{invite.responded_at ? ` · dijawab ${formatDate(invite.responded_at)}` : ''}{invite.budget ? ` · ${invite.budget}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={invite.status} />
                  {wa && (
                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90" style={{ backgroundColor: '#0D9488' }}>WhatsApp</a>
                  )}
                  {contact?.email && <a href={`mailto:${contact.email}`} className="text-xs hover:underline" style={{ color: '#1A365D' }}>Email</a>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
