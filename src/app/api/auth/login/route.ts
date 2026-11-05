import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth-cookies';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const fail = () => NextResponse.json({ error: '账号或密码不正确，或没有访问权限。' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ownerId = process.env.HEALTH_OWNER_USER_ID;
  if (!base || !key || !ownerId) return NextResponse.json({ error: '登录服务尚未配置。' }, { status: 503 });
  let email = '', password = '';
  try { const obj = await req.json(); email = String(obj.email || '').trim(); password = String(obj.password || ''); } catch { return fail(); }
  if (!email || email.length > 254 || !password || password.length > 200) return fail();
  try {
    const upstream = await fetch(new URL('/auth/v1/token?grant_type=password', base), {
      method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }), cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) return fail();
    const session = await upstream.json();
    if (session.user?.id !== ownerId || !session.access_token || !session.refresh_token) return fail();
    await setAuthCookies(session);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: '登录服务暂不可用，请稍后重试。' }, { status: 502 }); }
}
