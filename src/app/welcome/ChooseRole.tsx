'use client'

import { useState, useTransition } from 'react'
import { chooseRole } from '@/app/actions/account'
import type { AccountRole } from '@/lib/supabase/types'

const OPTIONS: { value: AccountRole; title: string; desc: string }[] = [
  { value: 'talent', title: 'Talent Creative', desc: 'Pajang portfolio dan ditemukan recruiter. Gratis.' },
  { value: 'recruiter', title: 'Recruiter', desc: 'Cari, shortlist, dan undang talent creative.' },
]

export default function ChooseRole() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function pick(role: AccountRole) {
    setError('')
    startTransition(async () => {
      const result = await chooseRole(role)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>
      )}
      {OPTIONS.map(o => (
        <button
          key={o.value}
          onClick={() => pick(o.value)}
          disabled={pending}
          className="w-full text-left border rounded-xl p-5 transition-colors hover:border-navy disabled:opacity-50"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <p className="font-semibold text-sm mb-0.5" style={{ color: '#0A0E1A' }}>{o.title}</p>
          <p className="text-sm" style={{ color: '#6B7280' }}>{o.desc}</p>
        </button>
      ))}
    </div>
  )
}
