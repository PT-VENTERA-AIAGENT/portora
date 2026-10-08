import { redirect } from 'next/navigation'
import TalentProfileForm from '@/components/portora/TalentProfileForm'
import { getOwnTalentProfile, getViewer } from '@/lib/portora/session'

export const metadata = { title: 'Buat profil talent' }

export default async function OnboardingPage() {
  const { user } = await getViewer()
  if (!user) redirect('/login?next=/onboarding')
  if (await getOwnTalentProfile()) redirect('/dashboard')

  return (
    <main className="min-h-[calc(100vh-65px)] flex items-start justify-center px-4 py-10" style={{ backgroundColor: '#FAFAF7' }}>
      <TalentProfileForm
        mode="create"
        storageKey={`portora:onboarding:${user.id}`}
        initial={{
          full_name: (user.user_metadata?.full_name as string | undefined) ?? '',
          role: '',
          headline: '',
          bio: '',
          location: '',
          experience_years: '',
          rate_min: '',
          rate_max: '',
          skills: [],
          tools: [],
          industries: [],
          portfolio_links: [{ url: '', label: '' }],
          available: true,
          avatar_url: null,
          whatsapp: '',
          contact_email: user.email ?? '',
        }}
      />
    </main>
  )
}
