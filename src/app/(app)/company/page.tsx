import { redirect } from 'next/navigation'
import { getOwnRecruiterProfile, getViewer } from '@/lib/portora/session'
import { effectivePlan, PLANS, searchesUsed, STARTER_LIMITS } from '@/lib/portora/plan'
import { formatDate } from '@/lib/portora/format'
import { CompanyForm, UpgradeButton } from './CompanyClient'

const card = 'border rounded-2xl p-6 md:p-8'
const cardStyle = { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }

const FEATURES: { label: string; starter: string; growth: string }[] = [
  { label: 'Pencarian teks', starter: `${STARTER_LIMITS.searchesPerMonth} / bulan`, growth: 'Tak terbatas' },
  { label: 'Shortlist', starter: `${STARTER_LIMITS.shortlists} shortlist`, growth: 'Tak terbatas' },
  { label: 'Fit score', starter: '—', growth: '✓' },
  { label: 'Preview portfolio', starter: `${STARTER_LIMITS.portfolioPreview} karya`, growth: 'Semua karya' },
  { label: 'Export kandidat (CSV)', starter: '—', growth: '✓' },
]

export const metadata = { title: 'Perusahaan' }

export default async function CompanyPage() {
  const { user } = await getViewer()
  if (!user) redirect('/login?next=/company')
  const company = await getOwnRecruiterProfile()
  const plan = effectivePlan(company)
  const used = searchesUsed(company)

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs mb-2 font-mono" style={{ color: '#6B7280' }}>
          <span>Workspace</span><span>/</span><span style={{ color: '#0A0E1A' }}>Perusahaan</span>
        </div>
        <h1 className="text-3xl font-display tracking-tight">{company ? company.company_name : 'Profil perusahaan'}</h1>
        {!company && (
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Lengkapi profil perusahaan untuk mulai mencari talent. Akun baru otomatis mendapat trial paket Growth selama 14 hari.
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <section className={`${card} lg:col-span-3`} style={cardStyle}>
          <h2 className="font-semibold mb-5">Data perusahaan</h2>
          <CompanyForm company={company} defaultContactName={(user.user_metadata?.full_name as string | undefined) ?? ''} />
        </section>

        {company && (
          <section id="paket" className={`${card} lg:col-span-2 h-fit`} style={cardStyle}>
            <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>Paket aktif</p>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-2xl font-semibold">{PLANS[plan.plan].label}</p>
              {plan.onTrial && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#D97706' }}>Trial · {plan.trialDaysLeft} hari lagi</span>}
            </div>
            <p className="text-sm mb-5" style={{ color: '#6B7280' }}>
              {plan.onTrial && 'Setelah trial berakhir, akun kembali ke paket Starter (gratis).'}
              {!plan.onTrial && plan.plan === 'starter' && `Pencarian teks bulan ini: ${used}/${STARTER_LIMITS.searchesPerMonth}.`}
              {!plan.onTrial && plan.plan !== 'starter' && (plan.paidUntil ? `Aktif sampai ${formatDate(plan.paidUntil)}.` : 'Aktif.')}
            </p>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="text-xs" style={{ color: '#6B7280' }}>
                  <th className="text-left font-normal pb-2">Fitur</th>
                  <th className="text-left font-normal pb-2">Starter</th>
                  <th className="text-left font-normal pb-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map(f => (
                  <tr key={f.label} className="border-t" style={{ borderColor: '#E5E7EB' }}>
                    <td className="py-2">{f.label}</td>
                    <td className="py-2" style={{ color: '#6B7280' }}>{f.starter}</td>
                    <td className="py-2">{f.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(plan.plan === 'starter' || plan.onTrial) && (
              <div>
                <p className="text-sm mb-3" style={{ color: '#6B7280' }}>Growth: {PLANS.growth.price}. Aktivasi dibantu tim Portora.</p>
                <UpgradeButton />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
