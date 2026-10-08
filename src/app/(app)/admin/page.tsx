import Link from 'next/link'
import { notFound } from 'next/navigation'
import { moderateTalent, regenerateSummary, setRecruiterPlan } from '@/app/actions/admin'
import PortfolioTile from '@/components/portora/PortfolioTile'
import StatusBadge from '@/components/portora/StatusBadge'
import TalentAvatar from '@/components/portora/TalentAvatar'
import { aiSummaryEnabled } from '@/lib/portora/ai-summary'
import { ROLE_LABELS } from '@/lib/portora/constants'
import { formatDate, formatRate } from '@/lib/portora/format'
import { effectivePlan, PLANS } from '@/lib/portora/plan'
import { getViewer } from '@/lib/portora/session'
import type {
  Lead, ModerationLog, PortfolioItem, RecruiterProfile, StoredRecruiterLead, TalentContact, TalentProfile, TalentStatus,
} from '@/lib/supabase/types'

const TABS = [
  { key: 'moderasi', label: 'Moderasi' },
  { key: 'talent', label: 'Talent' },
  { key: 'recruiter', label: 'Recruiter' },
  { key: 'leads', label: 'Leads' },
  { key: 'log', label: 'Log' },
] as const
type TabKey = (typeof TABS)[number]['key']

const card = 'border rounded-2xl p-6'
const cardStyle = { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }
const btn = 'px-3 py-1.5 rounded-lg text-xs font-medium border hover:opacity-80'

export const metadata = { title: 'Admin' }

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string }> }) {
  const { supabase, isAdmin } = await getViewer()
  if (!isAdmin) notFound()
  const params = await searchParams
  const tab: TabKey = TABS.some(t => t.key === params.tab) ? (params.tab as TabKey) : 'moderasi'

  const statusCount = (status: TalentStatus) =>
    supabase.from('portora_talent_profiles').select('id', { count: 'exact', head: true }).eq('status', status)
  const [pending, approved, rejected, recruiters, leads] = await Promise.all([
    statusCount('pending'),
    statusCount('approved'),
    statusCount('rejected'),
    supabase.from('portora_recruiter_profiles').select('user_id', { count: 'exact', head: true }),
    supabase.from('portora_leads').select('id', { count: 'exact', head: true }),
  ])
  const stats = [
    { label: 'Menunggu review', value: pending.count ?? 0, color: '#D97706' },
    { label: 'Talent disetujui', value: approved.count ?? 0, color: '#0D9488' },
    { label: 'Perlu perbaikan', value: rejected.count ?? 0, color: '#6B7280' },
    { label: 'Recruiter', value: recruiters.count ?? 0, color: '#1A365D' },
    { label: 'Leads', value: leads.count ?? 0, color: '#1A365D' },
  ]

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs mb-2 font-mono" style={{ color: '#6B7280' }}>
            <span>Admin</span><span>/</span><span style={{ color: '#0A0E1A' }}>{TABS.find(t => t.key === tab)?.label}</span>
          </div>
          <h1 className="text-3xl font-display tracking-tight">Panel admin</h1>
        </div>
        <p className="text-xs" style={{ color: '#6B7280' }}>
          Ringkasan AI: {aiSummaryEnabled() ? <span style={{ color: '#0D9488' }}>aktif</span> : 'nonaktif (isi ANTHROPIC_API_KEY)'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="border rounded-xl p-4" style={cardStyle}>
            <p className="text-xs" style={{ color: '#6B7280' }}>{s.label}</p>
            <p className="font-mono text-2xl font-semibold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <nav className="flex gap-1 border-b mb-6 overflow-x-auto" style={{ borderColor: '#E5E7EB' }}>
        {TABS.map(t => (
          <Link key={t.key} href={`/admin?tab=${t.key}`} className="px-4 py-2 text-sm -mb-px border-b-2 whitespace-nowrap" style={{
            borderColor: tab === t.key ? '#1A365D' : 'transparent',
            color: tab === t.key ? '#0A0E1A' : '#6B7280',
            fontWeight: tab === t.key ? 600 : 400,
          }}>
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === 'moderasi' && <ModerationTab />}
      {tab === 'talent' && <TalentTab status={params.status} />}
      {tab === 'recruiter' && <RecruiterTab />}
      {tab === 'leads' && <LeadsTab />}
      {tab === 'log' && <LogTab />}
    </main>
  )
}

// Satu form per aksi: React 19.0 tidak mengirim name/value tombol submit ke server action.
function ModerateButton({ id, op, className, style, children }: {
  id: string
  op: 'approve' | 'reject' | 'feature' | 'unfeature'
  className: string
  style: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <form action={moderateTalent}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <button className={className} style={style}>{children}</button>
    </form>
  )
}

async function ModerationTab() {
  const { supabase } = await getViewer()
  const { data } = await supabase
    .from('portora_talent_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })
  const profiles = (data ?? []) as TalentProfile[]
  if (profiles.length === 0) {
    return <div className={`${card} text-center`} style={cardStyle}><p className="text-sm" style={{ color: '#6B7280' }}>Tidak ada profil yang menunggu review.</p></div>
  }

  const ids = profiles.map(p => p.id)
  const [{ data: itemRows }, { data: contactRows }] = await Promise.all([
    supabase.from('portora_portfolio_items').select('*').in('talent_profile_id', ids).order('sort_order', { ascending: true }),
    supabase.from('portora_talent_contacts').select('*').in('talent_profile_id', ids),
  ])
  const items = new Map<string, PortfolioItem[]>()
  for (const item of (itemRows ?? []) as PortfolioItem[]) items.set(item.talent_profile_id, [...(items.get(item.talent_profile_id) ?? []), item])
  const contacts = new Map(((contactRows ?? []) as TalentContact[]).map(c => [c.talent_profile_id, c]))

  return (
    <div className="space-y-4">
      {profiles.map(p => {
        const profileItems = items.get(p.id) ?? []
        const contact = contacts.get(p.id)
        return (
          <div key={p.id} className={card} style={cardStyle}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <TalentAvatar name={p.full_name} url={p.avatar_url} size={48} />
                  <div>
                    <Link href={`/talent/${p.username}`} className="font-semibold hover:underline">{p.full_name}</Link>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {ROLE_LABELS[p.role]}{p.location ? ` · ${p.location}` : ''} · dikirim {formatDate(p.submitted_at ?? p.created_at)}
                    </p>
                  </div>
                </div>
                {p.headline && <p className="text-sm font-medium mb-1">{p.headline}</p>}
                {p.bio && <p className="text-sm mb-3 whitespace-pre-line" style={{ color: '#6B7280' }}>{p.bio}</p>}
                <dl className="text-xs space-y-1 mb-3">
                  <div><dt className="inline" style={{ color: '#6B7280' }}>Skill: </dt><dd className="inline">{p.skills.join(', ') || '—'}</dd></div>
                  <div><dt className="inline" style={{ color: '#6B7280' }}>Tools: </dt><dd className="inline">{p.tools.join(', ') || '—'}</dd></div>
                  <div><dt className="inline" style={{ color: '#6B7280' }}>Tarif: </dt><dd className="inline">{formatRate(p.rate_min, p.rate_max) ?? '—'}</dd></div>
                  <div><dt className="inline" style={{ color: '#6B7280' }}>Kontak: </dt><dd className="inline">{contact?.whatsapp ?? '—'}{contact?.email ? ` · ${contact.email}` : ''}</dd></div>
                </dl>
                {(p.portfolio_links ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {p.portfolio_links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: '#1A365D' }}>{l.label || l.url}</a>
                    ))}
                  </div>
                )}
                {profileItems.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {profileItems.map(item => <PortfolioTile key={item.id} item={item} showTitle={false} />)}
                  </div>
                )}
              </div>
              <div className="lg:w-72 flex-shrink-0 space-y-2">
                <ModerateButton id={p.id} op="approve" className="w-full text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#0D9488' }}>
                  Setujui & tampilkan
                </ModerateButton>
                <form action={moderateTalent} className="space-y-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="op" value="reject" />
                  <textarea name="reason" rows={3} maxLength={500} placeholder="Alasan jika diminta perbaikan (dilihat talent)…"
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none" style={{ borderColor: '#E5E7EB' }} />
                  <button className="w-full border py-2.5 rounded-lg text-sm font-medium hover:opacity-80" style={{ borderColor: '#E5E7EB', color: '#DC2626' }}>
                    Minta perbaikan
                  </button>
                </form>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

async function TalentTab({ status }: { status?: string }) {
  const { supabase } = await getViewer()
  let q = supabase.from('portora_talent_profiles').select('*').order('created_at', { ascending: false }).limit(200)
  if (status === 'pending' || status === 'approved' || status === 'rejected') q = q.eq('status', status)
  const { data } = await q
  const profiles = (data ?? []) as TalentProfile[]

  return (
    <div>
      <div className="flex gap-2 mb-4 text-xs">
        {[['', 'Semua'], ['approved', 'Disetujui'], ['pending', 'Menunggu'], ['rejected', 'Perlu perbaikan']].map(([value, label]) => (
          <Link key={value} href={`/admin?tab=talent${value ? `&status=${value}` : ''}`} className="px-3 py-1.5 rounded-lg border" style={{
            borderColor: (status ?? '') === value ? '#1A365D' : '#E5E7EB',
            color: (status ?? '') === value ? '#1A365D' : '#6B7280',
            backgroundColor: '#FFFFFF',
          }}>{label}</Link>
        ))}
      </div>
      <div className="border rounded-2xl overflow-x-auto" style={cardStyle}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-left" style={{ color: '#6B7280' }}>
              <th className="font-normal px-4 py-3">Talent</th>
              <th className="font-normal px-4 py-3">Status</th>
              <th className="font-normal px-4 py-3">Ringkasan AI</th>
              <th className="font-normal px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id} className="border-t align-top" style={{ borderColor: '#E5E7EB' }}>
                <td className="px-4 py-3">
                  <Link href={`/talent/${p.username}`} className="font-medium hover:underline">{p.full_name}</Link>
                  {p.featured && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#D97706' }}>Featured</span>}
                  <p className="text-xs" style={{ color: '#6B7280' }}>{ROLE_LABELS[p.role]} · {formatDate(p.created_at)}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-xs max-w-xs" style={{ color: '#6B7280' }}>
                  {p.ai_summary ? <span title={p.ai_summary}>{p.ai_summary.slice(0, 90)}…</span> : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {p.status !== 'approved' && (
                      <ModerateButton id={p.id} op="approve" className={btn} style={{ borderColor: '#0D9488', color: '#0D9488' }}>Setujui</ModerateButton>
                    )}
                    {p.status === 'approved' && (
                      <>
                        <ModerateButton id={p.id} op={p.featured ? 'unfeature' : 'feature'} className={btn} style={{ borderColor: '#E5E7EB', color: '#D97706' }}>
                          {p.featured ? 'Lepas featured' : 'Jadikan featured'}
                        </ModerateButton>
                        <ModerateButton id={p.id} op="reject" className={btn} style={{ borderColor: '#E5E7EB', color: '#DC2626' }}>Turunkan</ModerateButton>
                      </>
                    )}
                    <form action={regenerateSummary}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className={btn} style={{ borderColor: '#E5E7EB', color: '#1A365D' }} disabled={!aiSummaryEnabled()}>
                        {p.ai_summary ? 'Buat ulang ringkasan' : 'Buat ringkasan AI'}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {profiles.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>Tidak ada data.</p>}
      </div>
    </div>
  )
}

async function RecruiterTab() {
  const { supabase } = await getViewer()
  const { data } = await supabase.from('portora_recruiter_profiles').select('*').order('created_at', { ascending: false }).limit(200)
  const recruiters = (data ?? []) as RecruiterProfile[]

  return (
    <div className="border rounded-2xl overflow-x-auto" style={cardStyle}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-left" style={{ color: '#6B7280' }}>
            <th className="font-normal px-4 py-3">Perusahaan</th>
            <th className="font-normal px-4 py-3">Paket efektif</th>
            <th className="font-normal px-4 py-3">Ubah paket</th>
          </tr>
        </thead>
        <tbody>
          {recruiters.map(r => {
            const plan = effectivePlan(r)
            return (
              <tr key={r.user_id} className="border-t align-top" style={{ borderColor: '#E5E7EB' }}>
                <td className="px-4 py-3">
                  <p className="font-medium">{r.company_name}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {[r.industry, r.company_size, r.contact_name, r.contact_whatsapp].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Daftar {formatDate(r.created_at)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{PLANS[plan.plan].label}{plan.onTrial ? ' (trial)' : ''}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {plan.onTrial ? `Trial sisa ${plan.trialDaysLeft} hari` : plan.paidUntil ? `Sampai ${formatDate(plan.paidUntil)}` : plan.plan === 'starter' ? 'Gratis' : 'Tanpa batas waktu'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <form action={setRecruiterPlan} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="user_id" value={r.user_id} />
                    <select name="plan" defaultValue={r.plan} className="border rounded-lg px-2 py-1.5 text-xs" style={{ borderColor: '#E5E7EB' }}>
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <select name="months" defaultValue="1" className="border rounded-lg px-2 py-1.5 text-xs" style={{ borderColor: '#E5E7EB' }}>
                      <option value="1">1 bulan</option>
                      <option value="3">3 bulan</option>
                      <option value="12">12 bulan</option>
                      <option value="0">Tanpa batas</option>
                    </select>
                    <button className={btn} style={{ borderColor: '#1A365D', color: '#1A365D' }}>Simpan</button>
                  </form>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {recruiters.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>Belum ada recruiter.</p>}
    </div>
  )
}

async function LeadsTab() {
  const { supabase } = await getViewer()
  const [{ data: leadRows }, { data: demoRows }] = await Promise.all([
    supabase.from('portora_leads').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('portora_recruiter_leads').select('*').order('created_at', { ascending: false }).limit(200),
  ])
  const rows = [
    ...((leadRows ?? []) as Lead[]).map(l => ({ ...l, kind: l.source === 'upgrade-request' ? 'Minta upgrade' : `Popup · ${l.role ?? '-'}`, note: l.page })),
    ...((demoRows ?? []) as StoredRecruiterLead[]).map(l => ({ ...l, kind: 'Minta demo', note: l.message ?? null })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <div className="border rounded-2xl overflow-x-auto" style={cardStyle}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-left" style={{ color: '#6B7280' }}>
            <th className="font-normal px-4 py-3">Tanggal</th>
            <th className="font-normal px-4 py-3">Jenis</th>
            <th className="font-normal px-4 py-3">Nama</th>
            <th className="font-normal px-4 py-3">Kontak</th>
            <th className="font-normal px-4 py-3">Catatan</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(l => (
            <tr key={l.id} className="border-t align-top" style={{ borderColor: '#E5E7EB' }}>
              <td className="px-4 py-3 text-xs font-mono whitespace-nowrap" style={{ color: '#6B7280' }}>{formatDate(l.created_at)}</td>
              <td className="px-4 py-3 text-xs" style={{ color: l.kind === 'Minta upgrade' ? '#D97706' : '#0A0E1A' }}>{l.kind}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{l.name}</p>
                {l.company && <p className="text-xs" style={{ color: '#6B7280' }}>{l.company}</p>}
              </td>
              <td className="px-4 py-3 text-xs">
                <a href={`mailto:${l.email}`} className="hover:underline block" style={{ color: '#1A365D' }}>{l.email}</a>
                {l.whatsapp && <span style={{ color: '#6B7280' }}>{l.whatsapp}</span>}
              </td>
              <td className="px-4 py-3 text-xs max-w-xs" style={{ color: '#6B7280' }}>{l.note ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>Belum ada leads.</p>}
    </div>
  )
}

const LOG_LABELS: Record<ModerationLog['action'], string> = {
  approve: 'Menyetujui profil',
  reject: 'Meminta perbaikan',
  feature: 'Menjadikan featured',
  unfeature: 'Melepas featured',
  set_plan: 'Mengubah paket',
  ai_summary: 'Membuat ringkasan AI',
}

async function LogTab() {
  const { supabase } = await getViewer()
  const { data } = await supabase.from('portora_moderation_logs').select('*').order('created_at', { ascending: false }).limit(100)
  const logs = (data ?? []) as ModerationLog[]
  const talentIds = [...new Set(logs.map(l => l.talent_profile_id).filter((id): id is string => !!id))]
  const recruiterIds = [...new Set(logs.map(l => l.recruiter_user_id).filter((id): id is string => !!id))]
  const [{ data: talentRows }, { data: recruiterRows }] = await Promise.all([
    talentIds.length ? supabase.from('portora_talent_profiles').select('id, full_name, username').in('id', talentIds) : Promise.resolve({ data: [] }),
    recruiterIds.length ? supabase.from('portora_recruiter_profiles').select('user_id, company_name').in('user_id', recruiterIds) : Promise.resolve({ data: [] }),
  ])
  const talentNames = new Map((talentRows ?? []).map(t => [t.id as string, t.full_name as string]))
  const companyNames = new Map((recruiterRows ?? []).map(r => [r.user_id as string, r.company_name as string]))

  return (
    <div className={card} style={cardStyle}>
      {logs.length === 0 ? (
        <p className="text-sm text-center" style={{ color: '#6B7280' }}>Belum ada aktivitas.</p>
      ) : (
        <ul className="space-y-3">
          {logs.map(l => (
            <li key={l.id} className="text-sm flex gap-4">
              <span className="text-xs font-mono w-28 flex-shrink-0" style={{ color: '#6B7280' }}>{formatDate(l.created_at)}</span>
              <span>
                {LOG_LABELS[l.action]}{' '}
                <span className="font-medium">
                  {l.talent_profile_id ? talentNames.get(l.talent_profile_id) ?? 'talent' : l.recruiter_user_id ? companyNames.get(l.recruiter_user_id) ?? 'recruiter' : ''}
                </span>
                {l.reason && <span style={{ color: '#6B7280' }}>: {l.reason}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
