'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addPortfolioItem, deletePortfolioItem, respondInvite, setAvailability, setVisibility } from '@/app/actions/talent'
import PortfolioTile from '@/components/portora/PortfolioTile'
import { EMPTY_ITEM_DRAFT, PortfolioItemAdder, type ItemDraft } from '@/components/portora/TalentProfileForm'
import type { PortfolioItem } from '@/lib/supabase/types'

export function AvailabilityToggle({ initial }: { initial: boolean }) {
  const [available, setAvailable] = useState(initial)
  const [pending, startTransition] = useTransition()

  function toggle() {
    const nextValue = !available
    startTransition(async () => {
      const result = await setAvailability(nextValue)
      if (result.error) { toast.error(result.error); return }
      setAvailable(nextValue)
      toast.success(nextValue ? 'Kamu tampil sebagai open to work' : 'Status open to work dimatikan')
    })
  }

  return (
    <button onClick={toggle} disabled={pending} className="w-full flex items-center justify-between gap-3 text-left disabled:opacity-60">
      <div>
        <p className="text-sm font-medium">Open to work</p>
        <p className="text-xs" style={{ color: '#6B7280' }}>{available ? 'Recruiter melihat kamu siap menerima proyek.' : 'Profil tetap tampil, tanpa label open to work.'}</p>
      </div>
      <span className="w-10 h-6 rounded-full p-0.5 flex-shrink-0 transition-colors" style={{ backgroundColor: available ? '#0D9488' : '#E5E7EB' }}>
        <span className="block w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: available ? 'translateX(16px)' : 'none' }} />
      </span>
    </button>
  )
}

export function VisibilityToggle({ initial }: { initial: boolean }) {
  const [visible, setVisible] = useState(initial)
  const [pending, startTransition] = useTransition()

  function toggle() {
    const nextValue = !visible
    startTransition(async () => {
      const result = await setVisibility(nextValue)
      if (result.error) { toast.error(result.error); return }
      setVisible(nextValue)
      toast.success(nextValue ? 'Profil tampil lagi di pencarian' : 'Profil disembunyikan dari publik')
    })
  }

  return (
    <button onClick={toggle} disabled={pending} className="w-full flex items-center justify-between gap-3 text-left disabled:opacity-60">
      <div>
        <p className="text-sm font-medium">Tampilkan profil</p>
        <p className="text-xs" style={{ color: '#6B7280' }}>{visible ? 'Profil bisa ditemukan recruiter & dibuka publik.' : 'Tersembunyi: hanya kamu yang bisa melihat.'}</p>
      </div>
      <span className="w-10 h-6 rounded-full p-0.5 flex-shrink-0 transition-colors" style={{ backgroundColor: visible ? '#0D9488' : '#E5E7EB' }}>
        <span className="block w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: visible ? 'translateX(16px)' : 'none' }} />
      </span>
    </button>
  )
}

export function InviteActions({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition()

  function respond(status: 'accepted' | 'declined') {
    startTransition(async () => {
      const result = await respondInvite(inviteId, status)
      if (result.error) { toast.error(result.error); return }
      toast.success(status === 'accepted' ? 'Undangan diterima. Recruiter sekarang bisa melihat kontakmu.' : 'Undangan ditolak')
    })
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => respond('declined')} disabled={pending} className="border px-4 py-2 rounded-lg text-sm hover:opacity-80 disabled:opacity-50" style={{ borderColor: '#E5E7EB' }}>Tolak</button>
      <button onClick={() => respond('accepted')} disabled={pending} className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#0D9488' }}>Terima & bagikan kontak</button>
    </div>
  )
}

export function PortfolioManager({ items }: { items: PortfolioItem[] }) {
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<ItemDraft>(EMPTY_ITEM_DRAFT)
  const [pending, startTransition] = useTransition()

  function remove(id: string) {
    if (!confirm('Hapus karya ini?')) return
    startTransition(async () => {
      const result = await deletePortfolioItem(id)
      if (result.error) toast.error(result.error)
      else toast.success('Karya dihapus')
    })
  }

  return (
    <div>
      {items.length === 0 ? (
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Belum ada karya yang diunggah. Karya membuat profilmu jauh lebih meyakinkan di mata recruiter.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {items.map(item => (
            <div key={item.id} className="relative">
              <PortfolioTile item={item} />
              <button onClick={() => remove(item.id)} disabled={pending} aria-label="Hapus karya"
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-xs text-white disabled:opacity-50" style={{ backgroundColor: 'rgba(10,14,26,0.7)' }}>×</button>
            </div>
          ))}
        </div>
      )}
      {error && <div className="rounded-lg px-3 py-2 text-sm mb-3" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>}
      <PortfolioItemAdder
        draft={draft}
        onDraftChange={setDraft}
        busy={pending}
        onError={setError}
        onAdd={item => new Promise<void>(resolve => {
          startTransition(async () => {
            const result = await addPortfolioItem(item)
            if (result.error) setError(result.error)
            else toast.success('Karya ditambahkan')
            resolve()
          })
        })}
      />
    </div>
  )
}
