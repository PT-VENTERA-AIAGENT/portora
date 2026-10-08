'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type LeadData = {
  name: string;
  email: string;
  whatsapp?: string;
  company?: string;
  role?: 'recruiter' | 'talent' | 'other';
  source?: string;
  page?: string;
  // Honeypot: input tersembunyi yang hanya diisi bot.
  website?: string;
};

export type ActionResult = { success: boolean; error?: string };

const optional = (max: number) => z.string().trim().max(max).optional().transform(v => v || null);
const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  whatsapp: z.string().trim().regex(/^\+?[0-9][0-9\s-]{7,18}$/).optional().or(z.literal('')).transform(v => v || null),
  company: optional(120),
  role: z.enum(['recruiter', 'talent', 'other']).optional(),
  source: optional(40),
  page: optional(200),
});

const INVALID = 'Periksa kembali nama, email, dan nomor WhatsApp.';

export async function submitLead(data: LeadData): Promise<ActionResult> {
  if (data.website) return { success: true };
  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: INVALID };
  try {
    const { error } = await supabase.from('portora_leads').insert({
      ...parsed.data,
      role: parsed.data.role ?? 'other',
      source: parsed.data.source ?? 'popup',
    });

    if (error) {
      if (error.code === '42P01') {
        return { success: false, error: 'Database belum dikonfigurasi.' };
      }
      console.error('Supabase error:', error);
      return { success: false, error: 'Gagal menyimpan. Coba lagi atau hubungi via WhatsApp.' };
    }

    return { success: true };
  } catch (err) {
    console.error('submitLead error:', err);
    return { success: false, error: 'Terjadi kesalahan.' };
  }
}

// Form "Minta demo" di /for-recruiters.
export async function submitDemoRequest(data: {
  name: string; email: string; company?: string; whatsapp?: string; message?: string; website?: string;
}): Promise<ActionResult> {
  if (data.website) return { success: true };
  const parsed = leadSchema.pick({ name: true, email: true, whatsapp: true, company: true })
    .extend({ message: optional(1000) })
    .safeParse(data);
  if (!parsed.success) return { success: false, error: INVALID };

  const { error } = await supabase.from('portora_recruiter_leads').insert({ ...parsed.data, source: 'portora-for-recruiters' });
  if (error) {
    console.error('submitDemoRequest error:', error);
    return { success: false, error: 'Terjadi kesalahan. Coba lagi atau hubungi kami via WhatsApp.' };
  }
  return { success: true };
}
