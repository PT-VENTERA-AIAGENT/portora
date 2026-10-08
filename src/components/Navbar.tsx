import Link from 'next/link'
import MobileMenu from '@/components/portora/MobileMenu'
import { getOwnTalentProfile, getViewer } from '@/lib/portora/session'
import { initials } from '@/lib/portora/format'

const linkClass = 'px-3 py-1.5 transition-colors hover:opacity-80'
const linkStyle = { color: '#6B7280' }

const MARKETING_LINKS = [
  { href: '/for-recruiters', label: 'For Recruiters' },
  { href: '/for-talent', label: 'For Talent' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
]

export default async function Navbar() {
  const { user, role, isAdmin } = await getViewer()
  const talentProfile = role === 'talent' ? await getOwnTalentProfile() : null

  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''
  const initial = initials(name) || '?'

  const appLinks: { href: string; label: string }[] =
    role === 'recruiter'
      ? [
          { href: '/discover', label: 'Talent Search' },
          { href: '/shortlists', label: 'Shortlist' },
          { href: '/invites', label: 'Undangan' },
          { href: '/company', label: 'Perusahaan' },
        ]
      : role === 'talent'
        ? [
            { href: '/dashboard', label: 'Dashboard' },
            ...(talentProfile ? [{ href: `/talent/${talentProfile.username}`, label: 'Profil saya' }] : []),
            { href: '/blog', label: 'Blog' },
          ]
        : [{ href: '/welcome', label: 'Pilih role' }]

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ backgroundColor: 'rgba(250,250,247,0.9)', borderColor: '#E5E7EB' }}>
      <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1A365D' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight leading-none" style={{ color: '#0A0E1A' }}>Portora.id</p>
              <p className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: '#6B7280' }}>by TalentRank</p>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            {user ? (
              <>
                {appLinks.map(l => <Link key={l.href} href={l.href} className={linkClass} style={linkStyle}>{l.label}</Link>)}
                {isAdmin && <Link href="/admin" className={linkClass} style={{ color: '#D97706' }}>Admin</Link>}
              </>
            ) : (
              <>
                {MARKETING_LINKS.map(l => <Link key={l.href} href={l.href} className={linkClass} style={linkStyle}>{l.label}</Link>)}
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <MobileMenu links={[...appLinks, ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []), { href: '/account', label: 'Akun' }]} signedIn />
              <form action="/auth/logout" method="POST" className="hidden lg:block">
                <button type="submit" className="inline-flex px-3 py-2 text-sm transition-colors hover:opacity-80" style={linkStyle}>
                  Keluar
                </button>
              </form>
              <Link href="/account" title={`${name} · Akun`} aria-label="Akun" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>
                {initial}
              </Link>
            </>
          ) : (
            <>
              <MobileMenu links={MARKETING_LINKS} signedIn={false} />
              <Link href="/login" className="hidden lg:inline-flex px-3 py-2 text-sm transition-colors hover:opacity-80" style={linkStyle}>
                Log in
              </Link>
              <Link
                href="/register?role=recruiter"
                className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1A365D' }}
              >
                Start free trial
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 12h14" />
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
