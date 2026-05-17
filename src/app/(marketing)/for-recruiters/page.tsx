'use client'
import { useState } from 'react'
import Link from 'next/link'
import { submitRecruiterLead } from '@/lib/supabase/portora'

export default function ForRecruitersPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
      <section className="px-6 pt-20 pb-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider mb-4 block" style={{ color: '#0D9488' }}>For Recruiters</span>
            <h1 className="font-display text-5xl tracking-tight mb-6">Shortlist talent creative 3x lebih cepat</h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: '#6B7280' }}>
              Portora.id memberi recruiter satu tempat untuk search, screen, dan shortlist designer, editor, dan content creative terbaik Indonesia.
            </p>
            <Link href="/discover" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ backgroundColor: '#1A365D' }}>
              Coba gratis 14 hari
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-y" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-3 gap-8">
          {[
            { stat: '1,200+', label: 'Talent verified', desc: 'Portfolio terverifikasi oleh tim kurasi Portora' },
            { stat: '3x', label: 'Lebih cepat shortlist', desc: 'Dibanding proses manual buka portfolio satu-satu' },
            { stat: '92%', label: 'Satisfaction rate', desc: 'Recruiter puas dengan kualitas kandidat' },
          ].map(s => (
            <div key={s.stat} className="text-center">
              <p className="text-4xl font-bold mb-1 font-mono" style={{ color: '#1A365D' }}>{s.stat}</p>
              <p className="font-semibold mb-1">{s.label}</p>
              <p className="text-sm" style={{ color: '#6B7280' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-lg mx-auto border rounded-2xl p-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <h2 className="font-display text-2xl mb-2">Minta demo</h2>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Kami akan hubungi dalam 1 hari kerja.</p>
          <RecruiterLeadForm />
        </div>
      </section>
    </div>
  )
}

function RecruiterLeadForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const { error } = await submitRecruiterLead({
      name: fd.get('name') as string,
      company: fd.get('company') as string,
      email: fd.get('email') as string,
      whatsapp: fd.get('whatsapp') as string,
      message: fd.get('message') as string,
    })
    setLoading(false)
    if (error) {
      setError('Terjadi kesalahan. Coba lagi atau hubungi kami via WhatsApp.')
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(13,148,136,0.1)' }}>
        <svg className="w-6 h-6" style={{ color: '#0D9488' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="font-semibold mb-2">Terima kasih!</h3>
      <p className="text-sm" style={{ color: '#6B7280' }}>Kami akan menghubungi kamu dalam 1 hari kerja.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
          {error}
        </div>
      )}
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Nama lengkap *</label>
        <input name="name" required placeholder="Budi Santoso" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: '#E5E7EB' }} />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Perusahaan</label>
        <input name="company" placeholder="PT Contoh Digital" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: '#E5E7EB' }} />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Email *</label>
        <input name="email" type="email" required placeholder="budi@perusahaan.com" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: '#E5E7EB' }} />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>WhatsApp</label>
        <input name="whatsapp" type="tel" placeholder="08123456789" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: '#E5E7EB' }} />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Posisi yang dicari (opsional)</label>
        <textarea name="message" rows={2} placeholder="Misal: Graphic Designer untuk konten sosmed brand beauty" className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none" style={{ borderColor: '#E5E7EB' }} />
      </div>
      <button type="submit" disabled={loading} className="w-full text-white py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#1A365D' }}>
        {loading ? 'Mengirim…' : 'Minta demo gratis'}
      </button>
    </form>
  )
}
