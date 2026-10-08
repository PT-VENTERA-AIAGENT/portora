export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? null

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="px-6 py-16">
      <article className="max-w-3xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#0D9488' }}>Legal</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">{title}</h1>
        <p className="text-sm mb-10" style={{ color: '#6B7280' }}>Terakhir diperbarui: {updated}</p>
        <div className="prose-portora text-[15px] leading-relaxed" style={{ color: '#374151' }}>{children}</div>
      </article>
    </main>
  )
}

export function ContactLine() {
  return SUPPORT_EMAIL ? (
    <>email ke <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></>
  ) : (
    <>formulir di halaman <a href="/for-recruiters">For Recruiters</a></>
  )
}
