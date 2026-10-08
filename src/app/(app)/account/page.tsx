import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getViewer } from '@/lib/portora/session'
import { ChangePassword, DeleteAccount } from './AccountClient'

export const metadata = { title: 'Akun' }

const card = 'border rounded-2xl p-6 md:p-8'
const cardStyle = { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }

export default async function AccountPage() {
  const { user, role } = await getViewer()
  if (!user) redirect('/login?next=/account')

  const isGoogle = user.app_metadata?.provider === 'google'
  const what = role === 'talent'
    ? 'profil talent, karya, kontak, dan undangan yang kamu terima'
    : role === 'recruiter'
      ? 'profil perusahaan, shortlist, dan undangan yang kamu kirim'
      : 'semua data akunmu'

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs mb-2 font-mono" style={{ color: '#6B7280' }}>
          <span>Pengaturan</span><span>/</span><span style={{ color: '#0A0E1A' }}>Akun</span>
        </div>
        <h1 className="text-3xl font-display tracking-tight">Akun</h1>
      </div>

      <div className="space-y-6">
        <section className={card} style={cardStyle}>
          <h2 className="font-semibold mb-4">Info akun</h2>
          <dl className="text-sm space-y-2">
            <div className="flex gap-3"><dt className="w-28" style={{ color: '#6B7280' }}>Email</dt><dd>{user.email}</dd></div>
            <div className="flex gap-3"><dt className="w-28" style={{ color: '#6B7280' }}>Peran</dt><dd>{role === 'talent' ? 'Talent creative' : role === 'recruiter' ? 'Recruiter' : '—'}</dd></div>
            <div className="flex gap-3"><dt className="w-28" style={{ color: '#6B7280' }}>Login dengan</dt><dd>{isGoogle ? 'Google' : 'Email & password'}</dd></div>
          </dl>
          <p className="text-xs mt-4" style={{ color: '#6B7280' }}>
            {role === 'talent' && <>Ubah profil publik di <Link href="/dashboard/profile" className="hover:underline" style={{ color: '#1A365D' }}>Edit profil</Link>.</>}
            {role === 'recruiter' && <>Ubah data perusahaan di <Link href="/company" className="hover:underline" style={{ color: '#1A365D' }}>Perusahaan</Link>.</>}
          </p>
        </section>

        <section className={card} style={cardStyle}>
          <h2 className="font-semibold mb-1">{isGoogle ? 'Buat password' : 'Ganti password'}</h2>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            {isGoogle ? 'Opsional: agar bisa login dengan email & password selain Google.' : 'Gunakan minimal 6 karakter.'}
          </p>
          <ChangePassword />
        </section>

        <section className={card} style={{ ...cardStyle, borderColor: 'rgba(220,38,38,0.3)' }}>
          <h2 className="font-semibold mb-3" style={{ color: '#DC2626' }}>Hapus akun</h2>
          <DeleteAccount what={what} />
        </section>
      </div>
    </main>
  )
}
