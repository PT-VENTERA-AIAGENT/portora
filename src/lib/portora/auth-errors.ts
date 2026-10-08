// Pesan error Supabase Auth (bahasa Inggris) -> Bahasa Indonesia.
const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'Email atau password salah.'],
  [/email not confirmed/i, 'Email belum dikonfirmasi. Cek inbox kamu dan klik link konfirmasi.'],
  [/user already registered|already been registered/i, 'Email ini sudah terdaftar. Silakan login atau reset password.'],
  [/password should be at least/i, 'Password minimal 6 karakter.'],
  [/new password should be different/i, 'Password baru harus berbeda dari password lama.'],
  [/rate limit|too many requests|security purposes/i, 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'],
  [/unable to validate email|invalid email/i, 'Format email tidak valid.'],
  [/auth session missing|jwt expired|invalid jwt/i, 'Sesi berakhir. Silakan login lagi.'],
]

export function authErrorMessage(message: string | undefined | null) {
  if (!message) return 'Terjadi kesalahan. Coba lagi.'
  return MESSAGES.find(([re]) => re.test(message))?.[1] ?? message
}
