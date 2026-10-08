import Link from 'next/link'

// Kerangka halaman auth, sama dengan /login dan /register.
export default function AuthShell({ title, subtitle, children, footer }: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#FAFAF7' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1A365D' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: '#0A0E1A' }}>Portora.id</span>
          </Link>
          <h1 className="text-2xl font-display font-semibold tracking-tight" style={{ color: '#0A0E1A' }}>{title}</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{subtitle}</p>
        </div>
        <div className="border rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>{children}</div>
        {footer && <div className="text-center text-sm mt-4" style={{ color: '#6B7280' }}>{footer}</div>}
      </div>
    </main>
  )
}

export const authInputClass = 'w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-navy'
export const authInputStyle = { borderColor: '#E5E7EB' }
