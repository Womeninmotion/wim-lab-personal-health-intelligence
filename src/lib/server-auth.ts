import 'server-only';
import { cookies } from 'next/headers';

export type Owner = { id: string; email?: string };
export async function getVerifiedOwner(): Promise<Owner | null> {
  const token = (await cookies()).get('wim_access')?.value;
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ownerId = process.env.HEALTH_OWNER_USER_ID;
  if (!token || !base || !key || !ownerId) return null;
  try {
    const res = await fetch(new URL('/auth/v1/user', base), {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const obj = await res.json() as { id?: string; email?: string };
    if (obj.id !== ownerId) return null;
    return { id: obj.id, email: obj.email };
  } catch { return null; }
}
