'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { toggleShortlist } from '@/app/actions/recruiter'

export default function SaveButton({ talentId, initialSaved, variant = 'icon' }: { talentId: string; initialSaved: boolean; variant?: 'icon' | 'full' }) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await toggleShortlist(talentId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setSaved(!!result.saved)
      toast.success(result.saved ? 'Disimpan ke shortlist' : 'Dihapus dari shortlist')
    })
  }

  const icon = (
    <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )

  if (variant === 'full') {
    return (
      <button
        onClick={onClick}
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 border py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-50"
        style={{ borderColor: saved ? '#1A365D' : '#E5E7EB', color: '#1A365D' }}
      >
        {icon}
        {saved ? 'Tersimpan di shortlist' : 'Simpan ke shortlist'}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-label={saved ? 'Hapus dari shortlist' : 'Simpan ke shortlist'}
      title={saved ? 'Hapus dari shortlist' : 'Simpan ke shortlist'}
      className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors hover:border-navy disabled:opacity-50 flex-shrink-0"
      style={{ borderColor: saved ? '#1A365D' : '#E5E7EB', color: saved ? '#1A365D' : '#6B7280', backgroundColor: '#FFFFFF' }}
    >
      {icon}
    </button>
  )
}
