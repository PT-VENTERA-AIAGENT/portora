'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { submitLead } from '@/app/actions/submit-lead';
import { toast } from 'sonner';

const STORAGE_KEY = 'portora_lead_captured';
const DELAY_MS = 25000;

export default function LeadCapturePopup() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', role: 'recruiter' as const });

  const trigger = useCallback(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) return;
    setOpen(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(trigger, DELAY_MS);

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [trigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    const result = await submitLead({
      name: form.name,
      email: form.email,
      whatsapp: form.whatsapp || undefined,
      role: form.role,
      source: 'popup',
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
    setSubmitting(false);
    if (result.success) {
      localStorage.setItem(STORAGE_KEY, '1');
      toast.success('Terima kasih! Kami akan hubungi kamu segera.');
      setOpen(false);
    } else {
      toast.error(result.error || 'Gagal. Coba lagi.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-8 shadow-2xl focus:outline-none"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider mb-3 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(13,148,136,0.1)', color: '#0D9488' }}>
              Khusus untuk kamu
            </div>
            <Dialog.Title className="text-2xl font-bold mb-2" style={{ color: '#0A0E1A' }}>
              Temukan creative talent lebih cepat.
            </Dialog.Title>
            <Dialog.Description className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
              Daftar gratis — dapatkan akses ke 1,200+ portfolio graphic designer, video editor, dan social creative Indonesia.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Nama lengkap *</label>
              <input
                type="text"
                required
                placeholder="Budi Santoso"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', color: '#0A0E1A' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#0D9488'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Email kerja *</label>
              <input
                type="email"
                required
                placeholder="budi@perusahaan.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', color: '#0A0E1A' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#0D9488'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>WhatsApp (opsional)</label>
              <input
                type="tel"
                placeholder="08123456789"
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', color: '#0A0E1A' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#0D9488'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Saya adalah</label>
              <div className="flex gap-2">
                {(['recruiter', 'talent'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors"
                    style={{
                      borderColor: form.role === r ? '#0D9488' : '#E5E7EB',
                      backgroundColor: form.role === r ? 'rgba(13,148,136,0.06)' : 'transparent',
                      color: form.role === r ? '#0D9488' : '#6B7280',
                    }}
                  >
                    {r === 'recruiter' ? 'Recruiter / HR' : 'Creative Talent'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
              style={{ backgroundColor: '#1A365D' }}
            >
              {submitting ? 'Memproses…' : 'Daftar gratis sekarang →'}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: '#9CA3AF' }}>
            Gratis selamanya · Tanpa kartu kredit · Privasi terjaga
          </p>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:opacity-70"
              style={{ color: '#9CA3AF' }}
              aria-label="Tutup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
