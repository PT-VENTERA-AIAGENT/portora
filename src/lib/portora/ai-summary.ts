import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { ROLE_LABELS } from './constants'
import type { PortfolioItem, TalentProfile } from '@/lib/supabase/types'

export function aiSummaryEnabled() {
  return !!process.env.ANTHROPIC_API_KEY
}

const SYSTEM = `Kamu membantu recruiter di Portora.id menilai talent kreatif Indonesia (graphic designer, video editor, social media creative).
Tulis ringkasan profil dalam Bahasa Indonesia, 3–4 kalimat, maksimal 90 kata, dalam satu paragraf tanpa heading atau bullet.
Sebutkan spesialisasi, kekuatan yang terlihat dari skill/tools/karya, dan cocok untuk kebutuhan seperti apa.
Hanya gunakan fakta dari data profil. Jangan mengarang klien, angka, atau pengalaman yang tidak ada. Jika data tipis, katakan secara singkat apa yang belum terlihat.`

// Mengembalikan teks ringkasan, atau null bila fitur tidak aktif / model menolak.
export async function generateTalentSummary(profile: TalentProfile, items: PortfolioItem[]) {
  if (!aiSummaryEnabled()) return null

  const data = {
    nama: profile.full_name,
    role: ROLE_LABELS[profile.role],
    headline: profile.headline,
    lokasi: profile.location,
    pengalaman_tahun: profile.experience_years,
    skill: profile.skills,
    tools: profile.tools,
    industri: profile.industries,
    bio: profile.bio,
    open_to_work: profile.available,
    karya: items.map(i => ({ judul: i.title, deskripsi: i.description, jenis: i.media_type })),
    link_portfolio: (profile.portfolio_links ?? []).map(l => l.label || l.url),
  }

  const client = new Anthropic()
  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: `Data profil talent (JSON):\n${JSON.stringify(data, null, 2)}` }],
    })

    if (response.stop_reason === 'refusal') {
      console.warn('[ai-summary] refusal', response.stop_details?.category)
      return null
    }
    const text = response.content
      .flatMap(block => (block.type === 'text' ? [block.text] : []))
      .join('')
      .trim()
    return text || null
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('[ai-summary] ANTHROPIC_API_KEY tidak valid')
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error('[ai-summary] rate limited')
    } else if (error instanceof Anthropic.APIError) {
      console.error(`[ai-summary] API error ${error.status}: ${error.message}`)
    } else {
      console.error('[ai-summary] gagal', error)
    }
    return null
  }
}
