'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { requestUpgrade, saveCompanyProfile } from '@/app/actions/recruiter'
import { COMPANY_SIZES, INDUSTRIES } from '@/lib/portora/constants'
import { normalizeUrl } from '@/lib/portora/format'
import type { RecruiterProfile } from '@/lib/supabase/types'

const inputClass = 'w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-navy'
const inputStyle = { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }

export function CompanyForm({ company, defaultContactName }: { company: RecruiterProfile | null; defaultContactName: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const get = (k: string) => String(fd.get(k) ?? '')
    setError('')
    startTransition(async () => {
      const result = await saveCompanyProfile({
        company_name: get('company_name'),
        company_website: get('company_website'),
        industry: get('industry'),
        company_size: get('company_size'),
        contact_name: get('contact_name'),
        contact_whatsapp: get('contact_whatsapp'),
      })
      if (result.error) { setError(result.error); return }
      if (result.created) {
        router.push('/discover')
      } else {
        toast.success('Profil perusahaan disimpan')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>}
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Nama perusahaan *</label>
        <input name="company_name" required defaultValue={company?.company_name ?? ''} placeholder="PT Contoh Digital" className={inputClass} style={inputStyle} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Industri</label>
          <select name="industry" defaultValue={company?.industry ?? ''} className={inputClass} style={inputStyle}>
            <option value="">Pilih industri</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Jumlah karyawan</label>
          <select name="company_size" defaultValue={company?.company_size ?? ''} className={inputClass} style={inputStyle}>
            <option value="">Pilih</option>
            {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Website</label>
        <input name="company_website" type="text" inputMode="url" defaultValue={company?.company_website ?? ''} placeholder="perusahaan.com" className={inputClass} style={inputStyle}
          onBlur={e => { e.currentTarget.value = normalizeUrl(e.currentTarget.value) }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Nama PIC</label>
          <input name="contact_name" defaultValue={company?.contact_name ?? defaultContactName} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>WhatsApp PIC</label>
          <input name="contact_whatsapp" type="tel" defaultValue={company?.contact_whatsapp ?? ''} placeholder="08123456789" className={inputClass} style={inputStyle} />
        </div>
      </div>
      <p className="text-xs" style={{ color: '#6B7280' }}>Nama perusahaan, industri, dan WhatsApp PIC terlihat oleh talent yang kamu undang.</p>
      <button type="submit" disabled={pending} className="w-full text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#1A365D' }}>
        {pending ? 'Menyimpan…' : company ? 'Simpan perubahan' : 'Simpan & mulai cari talent'}
      </button>
    </form>
  )
}

export function UpgradeButton() {
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  if (sent) return <p className="text-sm" style={{ color: '#0D9488' }}>Permintaan terkirim. Tim Portora akan menghubungi kamu untuk aktivasi paket.</p>

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        const result = await requestUpgrade()
        if (result.error) toast.error(result.error)
        else setSent(true)
      })}
      className="text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: '#1A365D' }}
    >
      {pending ? 'Mengirim…' : 'Minta upgrade ke Growth'}
    </button>
  )
}
