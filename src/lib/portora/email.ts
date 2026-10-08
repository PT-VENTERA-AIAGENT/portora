import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

// Notifikasi email via Resend (opsional). Tanpa RESEND_API_KEY / EMAIL_FROM, email dilewati.
const API_URL = process.env.EMAIL_API_URL ?? 'https://api.resend.com'
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export function emailEnabled() {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function layout(title: string, body: string, cta?: { label: string; path: string }) {
  const button = cta
    ? `<p style="margin:24px 0 0"><a href="${siteUrl()}${cta.path}" style="display:inline-block;background:#1A365D;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">${esc(cta.label)}</a></p>`
    : ''
  return `<div style="background:#FAFAF7;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#0A0E1A">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E5E7EB;border-radius:16px;padding:28px">
    <p style="margin:0 0 16px;font-weight:600">Portora.id</p>
    <h1 style="font-size:20px;margin:0 0 12px">${esc(title)}</h1>
    <div style="font-size:14px;line-height:1.6;color:#0A0E1A">${body}</div>
    ${button}
  </div>
  <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#6B7280;text-align:center">Email otomatis dari Portora.id by TalentRank.</p>
</div>`
}

async function send(to: string | null | undefined, subject: string, html: string) {
  if (!to || !emailEnabled()) return false
  try {
    const res = await fetch(`${API_URL}/emails`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, html }),
    })
    if (!res.ok) console.error(`[email] gagal kirim "${subject}": ${res.status} ${await res.text()}`)
    return res.ok
  } catch (error) {
    console.error('[email] gagal kirim', error)
    return false
  }
}

// Email talent: kontak yang diisi saat onboarding, fallback email akun.
async function talentEmail(talentProfileId: string) {
  const admin = createAdminClient()
  if (!admin) return null
  const { data: profile } = await admin.from('portora_talent_profiles').select('user_id, full_name').eq('id', talentProfileId).maybeSingle()
  if (!profile) return null
  const { data: contact } = await admin.from('portora_talent_contacts').select('email').eq('talent_profile_id', talentProfileId).maybeSingle()
  if (contact?.email) return { email: contact.email as string, name: profile.full_name as string }
  const { data } = await admin.auth.admin.getUserById(profile.user_id as string)
  return { email: data.user?.email ?? null, name: profile.full_name as string }
}

async function accountEmail(userId: string) {
  const admin = createAdminClient()
  if (!admin) return null
  const { data } = await admin.auth.admin.getUserById(userId)
  return data.user?.email ?? null
}

export async function notifyInviteReceived(talentProfileId: string, companyName: string, projectTitle: string) {
  if (!emailEnabled()) return
  const talent = await talentEmail(talentProfileId)
  await send(
    talent?.email,
    `Undangan baru dari ${companyName}`,
    layout(
      `Halo ${talent?.name ?? ''}, ada undangan untukmu`,
      `<p><strong>${esc(companyName)}</strong> mengundangmu untuk <strong>${esc(projectTitle)}</strong>.</p><p>Buka dashboard untuk membaca detailnya lalu terima atau tolak. Kontakmu baru terlihat oleh recruiter setelah kamu menerima.</p>`,
      { label: 'Lihat undangan', path: '/dashboard' },
    ),
  )
}

export async function notifyInviteAccepted(recruiterUserId: string, talentName: string, username: string, projectTitle: string) {
  if (!emailEnabled()) return
  await send(
    await accountEmail(recruiterUserId),
    `${talentName} menerima undanganmu`,
    layout(
      `${talentName} menerima undangan`,
      `<p>Undangan <strong>${esc(projectTitle)}</strong> diterima. Kontak WhatsApp dan email talent sekarang terlihat di profilnya.</p>`,
      { label: 'Hubungi talent', path: `/talent/${username}` },
    ),
  )
}

export async function notifyModeration(talentProfileId: string, approved: boolean, reason: string | null, username: string) {
  if (!emailEnabled()) return
  const talent = await talentEmail(talentProfileId)
  if (approved) {
    await send(
      talent?.email,
      'Profil Portora kamu sudah tayang',
      layout(
        'Profilmu disetujui',
        '<p>Profilmu sekarang tampil di pencarian recruiter. Lengkapi karya dan aktifkan status open to work supaya lebih mudah ditemukan.</p>',
        { label: 'Lihat profil', path: `/talent/${username}` },
      ),
    )
  } else {
    await send(
      talent?.email,
      'Profil Portora kamu perlu perbaikan',
      layout(
        'Profilmu perlu perbaikan',
        `<p>Catatan reviewer: <strong>${esc(reason ?? 'Profil belum memenuhi standar kurasi.')}</strong></p><p>Perbaiki profil, lalu perubahan otomatis dikirim ulang untuk ditinjau.</p>`,
        { label: 'Perbaiki profil', path: '/dashboard/profile' },
      ),
    )
  }
}
