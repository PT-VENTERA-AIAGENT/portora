import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // 303: browser lanjut dengan GET ke beranda (307 akan mengulang POST).
  return NextResponse.redirect(new URL('/', request.url), 303)
}
