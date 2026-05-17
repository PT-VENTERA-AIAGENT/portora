'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'talent' | 'recruiter' | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) { setError('Pilih role kamu terlebih dahulu.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#FAFAF7' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1A365D' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: '#0A0E1A' }}>Portora.id</span>
          </Link>
          <h1 className="text-2xl font-display font-semibold tracking-tight" style={{ color: '#0A0E1A' }}>Buat akun baru</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Bergabung dengan Portora.id sekarang</p>
        </div>

        <div className="border rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 border rounded-lg py-2.5 text-sm font-medium transition-colors hover:opacity-80 mb-4"
            style={{ borderColor: '#E5E7EB', color: '#0A0E1A' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Daftar dengan Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
            <span className="text-xs" style={{ color: '#6B7280' }}>atau</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0E1A' }}>Nama lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0E1A' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="kamu@email.com"
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0E1A' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Min. 6 karakter"
                minLength={6}
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0E1A' }}>Kamu adalah</label>
              <div className="grid grid-cols-2 gap-2">
                {(['talent', 'recruiter'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="border rounded-lg py-2.5 text-sm font-medium transition-colors text-center"
                    style={{
                      borderWidth: role === r ? 2 : 1,
                      borderColor: role === r ? '#1A365D' : '#E5E7EB',
                      backgroundColor: role === r ? 'rgba(26,54,93,0.05)' : 'transparent',
                      color: role === r ? '#1A365D' : '#6B7280',
                    }}
                  >
                    {r === 'talent' ? 'Talent Creative' : 'Recruiter'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#1A365D' }}
            >
              {loading ? 'Loading...' : 'Daftar sekarang'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: '#6B7280' }}>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#1A365D' }}>
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}
