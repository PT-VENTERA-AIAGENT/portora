'use server';

import { createClient } from '@supabase/supabase-js';

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
};

export type ActionResult = { success: boolean; error?: string };

export async function submitLead(data: LeadData): Promise<ActionResult> {
  try {
    const { error } = await supabase.from('portora_leads').insert({
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp || null,
      company: data.company || null,
      role: data.role || 'other',
      source: data.source || 'popup',
      page: data.page || null,
      created_at: new Date().toISOString(),
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
