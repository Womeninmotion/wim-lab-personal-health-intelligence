import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedOwner } from '@/lib/server-auth';
import { defaultPersonalGoals } from '@/lib/personalGoals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };
const validDate = (s: string) => s === '' || (/^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T12:00:00Z')));
function config() {
  const base = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !secret) return null;
  const endpoint = new URL('/rest/v1/personal_goals', base);
  return { endpoint, secret };
}
const authHeaders = (secret: string) => ({ apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' });
export async function GET() {
  const owner = await getVerifiedOwner();
  if (!owner) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers });
  const c = config();
  if (!c) return NextResponse.json({ error: 'unconfigured' }, { status: 503, headers });
  c.endpoint.searchParams.set('select', 'display_name,event_name,event_date,goal_weight,daily_steps,start_weight,start_date,start_body_fat,goal_body_fat,weekly_run_km,weekly_ascent_m');
  c.endpoint.searchParams.set('user_id', `eq.${owner.id}`);
  try {
    const res = await fetch(c.endpoint, { headers: authHeaders(c.secret), cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!res.ok) return NextResponse.json({ error: 'read_failed' }, { status: 502, headers });
    const rows = await res.json() as Record<string, unknown>[];
    if (!rows.length) return NextResponse.json({ goals: null }, { headers });
    const g = rows[0];
    return NextResponse.json({ goals: {
      displayName: g.display_name ?? defaultPersonalGoals.displayName,
      eventName: g.event_name ?? defaultPersonalGoals.eventName,
      eventDate: g.event_date ?? '',
      goalWeight: String(g.goal_weight ?? ''),
      dailySteps: String(g.daily_steps ?? '8000'),
      startWeight: String(g.start_weight ?? ''),
      startDate: g.start_date ?? '',
      startBodyFat: String(g.start_body_fat ?? ''),
      goalBodyFat: String(g.goal_body_fat ?? ''),
      weeklyRunKm: String(g.weekly_run_km ?? ''),
      weeklyAscentM: String(g.weekly_ascent_m ?? ''),
    } }, { headers });
  } catch { return NextResponse.json({ error: 'read_unreachable' }, { status: 502, headers }); }
}
export async function PUT(req: NextRequest) {
  const owner = await getVerifiedOwner();
  if (!owner) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers });
  const c = config();
  if (!c) return NextResponse.json({ error: 'unconfigured' }, { status: 503, headers });
  let g: Record<string, unknown>;
  try { g = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers }); }
  const str = (k: string) => String(g[k] ?? '').trim();
  const eventDate = str('eventDate'), startDate = str('startDate');
  const target = Number(str('goalWeight')), start = str('startWeight') ? Number(str('startWeight')) : null;
  const steps = Number(str('dailySteps'));
  const optionalNumber = (field: string) => str(field) ? Number(str(field)) : null;
  const startFat = optionalNumber('startBodyFat'), goalFat = optionalNumber('goalBodyFat');
  const runKm = optionalNumber('weeklyRunKm'), ascentM = optionalNumber('weeklyAscentM');
  const validOptional = (v: number | null, lo: number, hi: number) => v === null || (Number.isFinite(v) && v >= lo && v <= hi);
  if (!validDate(eventDate) || !validDate(startDate) || str('displayName').length > 70 || str('eventName').length > 180 ||
      !Number.isFinite(target) || target < 20 || target > 300 ||
      (start !== null && (!Number.isFinite(start) || start < 20 || start > 300 || start <= target)) ||
      !Number.isInteger(steps) || steps < 1 || steps > 100000 ||
      (start !== null && !startDate) || (startDate && start === null) ||
      !validOptional(startFat, 1, 70) || !validOptional(goalFat, 1, 70) ||
      (startFat !== null && goalFat !== null && startFat <= goalFat) ||
      !validOptional(runKm, 0.1, 300) || !validOptional(ascentM, 1, 30000)) {
    return NextResponse.json({ error: 'invalid_goals' }, { status: 400, headers });
  }
  const payload = {
    user_id: owner.id, display_name: str('displayName') || 'Wendy', event_name: str('eventName') || 'UTMB 50K 越野赛',
    event_date: eventDate || null, goal_weight: target, daily_steps: steps,
    start_weight: start, start_date: startDate || null,
    start_body_fat: startFat, goal_body_fat: goalFat, weekly_run_km: runKm, weekly_ascent_m: ascentM,
    updated_at: new Date().toISOString(),
  };
  try {
    const res = await fetch(c.endpoint, { method: 'POST', headers: { ...authHeaders(c.secret), Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload), cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!res.ok) return NextResponse.json({ error: 'save_failed' }, { status: 502, headers });
    return NextResponse.json({ ok: true }, { headers });
  } catch { return NextResponse.json({ error: 'save_unreachable' }, { status: 502, headers }); }
}
