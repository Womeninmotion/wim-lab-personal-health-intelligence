import { NextResponse } from 'next/server';
import { getVerifiedOwner } from '@/lib/server-auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Activity = { coros_label_id:string; sport_type:number; activity_type:string; started_at:string; distance_km:number; ascent_m:number|null; duration_seconds:number|null; imported_at:string; import_method:string };
export async function GET() {
  const owner=await getVerifiedOwner();
  if(!owner) return NextResponse.json({error:'unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}});
  const base=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!base||!key) return NextResponse.json({error:'unconfigured'},{status:503});
  try {
    const url=new URL('/rest/v1/coros_activities',base);
    url.searchParams.set('select','coros_label_id,sport_type,activity_type,started_at,distance_km,ascent_m,duration_seconds,imported_at,import_method');
    url.searchParams.set('user_id',`eq.${owner.id}`);
    url.searchParams.set('order','started_at.desc');
    url.searchParams.set('limit','250');
    const result=await fetch(url,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store',signal:AbortSignal.timeout(10000)});
    if(!result.ok) return NextResponse.json({error:'database_read_failed'},{status:502});
    const activities=await result.json() as Activity[];
    return NextResponse.json({activities,source:'COROS',connectionStatus:'historical_import_only',lastImportAt:activities.reduce<string|null>((latest,a)=>!latest||a.imported_at>latest?a.imported_at:latest,null)},{headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex'}});
  } catch {return NextResponse.json({error:'database_unreachable'},{status:502});}
}
