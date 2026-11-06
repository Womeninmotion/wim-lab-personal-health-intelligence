import {NextResponse} from 'next/server';
import {getVerifiedOwner} from '@/lib/server-auth';
import {syncCoros} from '@/lib/coros-sync';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(){
 if(!await getVerifiedOwner())return NextResponse.json({error:'unauthorized'},{status:401});
 try{return NextResponse.json(await syncCoros(),{headers:{'Cache-Control':'no-store'}})}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:'COROS_SYNC_FAILED'},{status:502});}
}
