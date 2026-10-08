import type { FitScore } from '@/lib/portora/fit-score'

export function fitColor(total: number) {
  if (total >= 75) return '#0D9488'
  if (total >= 50) return '#1A365D'
  return '#D97706'
}

export default function FitScoreCard({ fit }: { fit: FitScore }) {
  const color = fitColor(fit.total)
  return (
    <div className="border rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-semibold">Fit score</h2>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Template: {fit.template.name}</p>
        </div>
        <p className="font-mono text-3xl font-semibold" style={{ color }}>
          {fit.total}<span className="text-sm" style={{ color: '#6B7280' }}>/100</span>
        </p>
      </div>
      <div className="space-y-3">
        {fit.parts.map(p => (
          <div key={p.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium" style={{ color: '#0A0E1A' }}>{p.label}</span>
              <span className="font-mono" style={{ color: '#6B7280' }}>{p.score}/{p.max}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="h-full rounded-full" style={{ width: `${(p.score / p.max) * 100}%`, backgroundColor: color }} />
            </div>
            <p className="text-[11px] mt-1" style={{ color: '#6B7280' }}>{p.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
