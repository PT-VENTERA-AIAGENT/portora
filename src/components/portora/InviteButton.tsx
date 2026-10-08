'use client'

import { useState, useTransition } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { sendInvite } from '@/app/actions/recruiter'

const inputClass = 'w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-navy'

export default function InviteButton({ talentId, talentName }: { talentId: string; talentName: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError('')
    startTransition(async () => {
      const result = await sendInvite({
        talent_profile_id: talentId,
        project_title: String(fd.get('project_title') ?? ''),
        message: String(fd.get('message') ?? ''),
        budget: String(fd.get('budget') ?? ''),
      })
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success(`Undangan terkirim ke ${talentName}`)
      setOpen(false)
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="w-full text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>
          Kirim undangan
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(10,14,26,0.4)' }} />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md rounded-2xl border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <Dialog.Title className="font-display text-xl mb-1">Undang {talentName}</Dialog.Title>
          <Dialog.Description className="text-sm mb-5" style={{ color: '#6B7280' }}>
            Kontak WhatsApp & email talent terbuka setelah undanganmu diterima.
          </Dialog.Description>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>}
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Judul proyek / posisi *</label>
              <input name="project_title" required minLength={3} maxLength={120} placeholder="Misal: Desain konten Instagram bulanan" className={inputClass} style={{ borderColor: '#E5E7EB' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Pesan</label>
              <textarea name="message" rows={4} maxLength={1000} placeholder="Ceritakan kebutuhan, timeline, dan cara kerja tim kamu." className={`${inputClass} resize-none`} style={{ borderColor: '#E5E7EB' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Budget (opsional)</label>
              <input name="budget" maxLength={80} placeholder="Misal: Rp 3–5 juta / proyek" className={inputClass} style={{ borderColor: '#E5E7EB' }} />
            </div>
            <div className="flex gap-2 pt-1">
              <Dialog.Close asChild>
                <button type="button" className="flex-1 border py-2.5 rounded-lg text-sm transition-colors hover:opacity-80" style={{ borderColor: '#E5E7EB' }}>Batal</button>
              </Dialog.Close>
              <button type="submit" disabled={pending} className="flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#1A365D' }}>
                {pending ? 'Mengirim…' : 'Kirim undangan'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
