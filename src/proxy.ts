import { NextRequest, NextResponse } from 'next/server';

// Next.js 16 proxy: refresh the private session near expiry. Ingest endpoint is independent.
export async function proxy(req: NextRequest) {
  const access = req.cookies.get('wim_access')?.value;
  const refresh = req.cookies.get('wim_refresh')?.value;
  const expire = Number(req.cookies.get('wim_exp')?.value || 0);
  if (!refresh || (access && expire > Date.now() + 120_000)) return NextResponse.next();
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const owner = process.env.HEALTH_OWNER_USER_ID;
  if (!base || !key || !owner) return NextResponse.next();
  try {
    const response = await fetch(new URL('/auth/v1/token?grant_type=refresh_token', base), {
      method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }), cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return NextResponse.next();
    const s = await response.json();
    if (!s.access_token || !s.refresh_token || s.user?.id !== owner) return NextResponse.next();
    const out = NextResponse.next();
    const opts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
    const age = Math.max(60, Math.min(Number(s.expires_in || 3600), 86400));
    out.cookies.set('wim_access', s.access_token, { ...opts, maxAge: age });
    out.cookies.set('wim_refresh', s.refresh_token, { ...opts, maxAge: 60 * 60 * 24 * 14 });
    out.cookies.set('wim_exp', String(Date.now() + age * 1000), { ...opts, maxAge: 60 * 60 * 24 * 14 });
    return out;
  } catch { return NextResponse.next(); }
}
export const config = { matcher: ['/((?!_next/|favicon.ico|icon.png|api/ingest/|api/auth/).*)'] };
