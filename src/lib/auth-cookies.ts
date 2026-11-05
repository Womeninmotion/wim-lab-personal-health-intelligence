import 'server-only';
import { cookies } from 'next/headers';

export type AuthSession = { access_token: string; refresh_token: string; expires_in?: number };
export async function setAuthCookies(session: AuthSession) {
  const jar = await cookies();
  const secure = process.env.NODE_ENV === 'production';
  const accessAge = Math.max(60, Math.min(Number(session.expires_in || 3600), 86400));
  const options = { httpOnly: true, secure, sameSite: 'strict' as const, path: '/' };
  jar.set('wim_access', session.access_token, { ...options, maxAge: accessAge });
  jar.set('wim_refresh', session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 14 });
  jar.set('wim_exp', String(Date.now() + accessAge * 1000), { ...options, maxAge: 60 * 60 * 24 * 14 });
}
export async function clearAuthCookies() {
  const jar = await cookies();
  for (const name of ['wim_access','wim_refresh','wim_exp']) jar.delete(name);
}
