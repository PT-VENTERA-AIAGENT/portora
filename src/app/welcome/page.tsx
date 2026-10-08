import { redirect } from 'next/navigation'
import { getViewer } from '@/lib/portora/session'
import { homePathFor } from '@/lib/portora/format'
import ChooseRole from './ChooseRole'

export const metadata = { title: 'Pilih peran' }

export default async function WelcomePage() {
  const { user, role } = await getViewer()
  if (!user) redirect('/login')
  if (role) redirect(homePathFor(role))

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#FAFAF7' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-display font-semibold tracking-tight" style={{ color: '#0A0E1A' }}>Satu langkah lagi</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Kamu menggunakan Portora.id sebagai apa?</p>
        </div>
        <ChooseRole />
      </div>
    </main>
  )
}
