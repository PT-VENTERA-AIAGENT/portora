'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Menu layar kecil. Navbar ada di layout yang tetap hidup saat navigasi,
// jadi menu ditutup manual ketika halaman berganti atau klik di luar.
export default function MobileMenu({ links, signedIn }: { links: { href: string; label: string }[]; signedIn: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    // Tanpa "relative": panel diposisikan terhadap <header> (sticky) supaya rata kanan layar.
    <details ref={ref} className="lg:hidden">
      <summary aria-label="Menu" className="list-none cursor-pointer w-9 h-9 rounded-lg border flex items-center justify-center [&::-webkit-details-marker]:hidden" style={{ borderColor: '#E5E7EB', color: '#0A0E1A', backgroundColor: '#FFFFFF' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </summary>
      <div className="absolute right-4 top-full mt-1 w-56 max-w-[calc(100vw-2rem)] rounded-xl border py-2 shadow-elev" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} className="block px-4 py-2 text-sm hover:bg-subtle" style={{ color: '#0A0E1A' }}>{l.label}</Link>
        ))}
        <div className="border-t my-2" style={{ borderColor: '#E5E7EB' }} />
        {signedIn ? (
          <form action="/auth/logout" method="POST">
            <button type="submit" className="w-full text-left px-4 py-2 text-sm hover:bg-subtle" style={{ color: '#DC2626' }}>Keluar</button>
          </form>
        ) : (
          <Link href="/login" className="block px-4 py-2 text-sm hover:bg-subtle" style={{ color: '#1A365D' }}>Log in</Link>
        )}
      </div>
    </details>
  )
}
