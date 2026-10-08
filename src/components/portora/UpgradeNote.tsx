import Link from 'next/link'

export default function UpgradeNote({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border border-dashed rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
      <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: '#D97706' }}>Paket Growth</p>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm mb-4" style={{ color: '#6B7280' }}>{desc}</p>
      <Link href="/company#paket" className="text-sm font-medium hover:underline" style={{ color: '#1A365D' }}>
        Lihat paket →
      </Link>
    </div>
  )
}
