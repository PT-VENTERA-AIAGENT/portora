import type { InviteStatus, TalentStatus } from '@/lib/supabase/types'

const STYLES: Record<TalentStatus | InviteStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Menunggu review', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  approved: { label: 'Disetujui', color: '#0D9488', bg: 'rgba(13,148,136,0.1)' },
  rejected: { label: 'Perlu perbaikan', color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  sent: { label: 'Menunggu jawaban', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  accepted: { label: 'Diterima', color: '#0D9488', bg: 'rgba(13,148,136,0.1)' },
  declined: { label: 'Ditolak', color: '#6B7280', bg: '#F3F4F6' },
}

export default function StatusBadge({ status, label }: { status: TalentStatus | InviteStatus; label?: string }) {
  const s = STYLES[status]
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ color: s.color, backgroundColor: s.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {label ?? s.label}
    </span>
  )
}
