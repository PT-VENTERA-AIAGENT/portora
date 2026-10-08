import Link from 'next/link'
import { redirect } from 'next/navigation'
import TalentProfileForm from '@/components/portora/TalentProfileForm'
import { getOwnTalentProfile, getViewer } from '@/lib/portora/session'

export const metadata = { title: 'Edit profil' }

export default async function EditProfilePage() {
  const { supabase } = await getViewer()
  const profile = await getOwnTalentProfile()
  if (!profile) redirect('/onboarding')

  const { data: contact } = await supabase
    .from('portora_talent_contacts')
    .select('whatsapp, email')
    .eq('talent_profile_id', profile.id)
    .maybeSingle()

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs mb-2 font-mono" style={{ color: '#6B7280' }}>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link><span>/</span><span style={{ color: '#0A0E1A' }}>Edit profil</span>
        </div>
        <h1 className="text-3xl font-display tracking-tight">Edit profil</h1>
      </div>
      <TalentProfileForm
        mode="edit"
        initial={{
          full_name: profile.full_name,
          role: profile.role,
          headline: profile.headline ?? '',
          bio: profile.bio ?? '',
          location: profile.location ?? '',
          experience_years: profile.experience_years?.toString() ?? '',
          rate_min: profile.rate_min?.toString() ?? '',
          rate_max: profile.rate_max?.toString() ?? '',
          skills: profile.skills ?? [],
          tools: profile.tools ?? [],
          industries: profile.industries ?? [],
          portfolio_links: (profile.portfolio_links ?? []).map(l => ({ url: l.url, label: l.label ?? '' })),
          available: profile.available,
          avatar_url: profile.avatar_url,
          whatsapp: contact?.whatsapp ?? '',
          contact_email: contact?.email ?? '',
        }}
      />
    </main>
  )
}
