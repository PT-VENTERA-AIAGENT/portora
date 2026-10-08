import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Harus berada di src/ (sejajar dengan src/app) supaya dibaca Next.js.
const TALENT_ROUTES = ['/dashboard', '/onboarding']
const RECRUITER_ROUTES = ['/discover', '/shortlists', '/invites', '/company']
const LOGIN_ROUTES = [...TALENT_ROUTES, ...RECRUITER_ROUTES, '/admin', '/welcome', '/account', '/reset-password']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

const matchesAny = (pathname: string, routes: string[]) =>
  routes.some(r => pathname === r || pathname.startsWith(`${r}/`))

function homeFor(role: unknown) {
  if (role === 'talent') return '/dashboard'
  if (role === 'recruiter') return '/discover'
  return '/welcome'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const redirectTo = (path: string, next?: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = next ? `?next=${encodeURIComponent(next)}` : ''
    const response = NextResponse.redirect(url)
    // Bawa cookie sesi yang baru di-refresh.
    supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
    return response
  }

  if (!user) {
    if (matchesAny(pathname, LOGIN_ROUTES)) return redirectTo('/login', pathname)
    return supabaseResponse
  }

  const role = user.user_metadata?.role
  if (matchesAny(pathname, AUTH_ROUTES)) return redirectTo(homeFor(role))
  if (!role && matchesAny(pathname, [...TALENT_ROUTES, ...RECRUITER_ROUTES])) return redirectTo('/welcome')
  if (role === 'talent' && matchesAny(pathname, RECRUITER_ROUTES)) return redirectTo('/dashboard')
  if (role === 'recruiter' && matchesAny(pathname, TALENT_ROUTES)) return redirectTo('/discover')

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
