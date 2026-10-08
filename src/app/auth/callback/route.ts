import { createClient } from "@/lib/supabase/server";
import { homePathFor, safeNext } from "@/lib/portora/format";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login`);

  // Akun Google baru belum punya role -> /welcome untuk memilih talent/recruiter.
  const role = data.user.user_metadata?.role;
  const next = role ? safeNext(searchParams.get("next")) : null;
  return NextResponse.redirect(`${origin}${next ?? homePathFor(role)}`);
}
