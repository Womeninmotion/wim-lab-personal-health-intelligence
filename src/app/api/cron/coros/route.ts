import {NextRequest,NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {syncCoros} from '@/lib/coros-sync';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(req:NextRequest){
 const expected=process.env.CRON_SECRET;
 const given=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
 if(!expected||!given||Buffer.byteLength(given)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(given),Buffer.from(expected)))return NextResponse.json({error:'unauthorized'},{status:401});
 try{return NextResponse.json(await syncCoros())}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'COROS_SYNC_FAILED'},{status:502});}
}
