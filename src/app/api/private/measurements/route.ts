import { NextResponse } from 'next/server';
import { getVerifiedOwner } from '@/lib/server-auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const owner = await getVerifiedOwner();
  if (!owner) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return NextResponse.json({ error: 'unconfigured' }, { status: 503 });
  try {
    const endpoint = new URL('/rest/v1/health_measurements', url);
    endpoint.searchParams.set('select','metric_name,value,unit,measured_at,source_app,source_device_label');
    endpoint.searchParams.set('user_id', `eq.${owner.id}`);
    endpoint.searchParams.set('source_app','eq.Mi Fitness');
    endpoint.searchParams.set('order','measured_at.desc');
    endpoint.searchParams.set('limit','400');
    const upstream = await fetch(endpoint, { headers: { apikey: secret, Authorization: `Bearer ${secret}` }, cache:'no-store', signal: AbortSignal.timeout(10000) });
    if (!upstream.ok) return NextResponse.json({ error: 'database_read_failed' }, { status: 502 });
    const rows = await upstream.json();
    return NextResponse.json({ measurements: rows, source: 'Mi Fitness / 小米 S800（用户确认）' }, { headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' } });
  } catch { return NextResponse.json({ error: 'database_unreachable' }, { status: 502 }); }
}
