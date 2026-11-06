import {NextResponse} from 'next/server';
import {getVerifiedOwner} from '@/lib/server-auth';
import {readConnection} from '@/lib/coros-oauth';
export const runtime='nodejs';
export async function GET(){
 if(!await getVerifiedOwner())return NextResponse.json({error:'unauthorized'},{status:401});
 try{const c=await readConnection();return NextResponse.json({connected:!!c,lastAttemptAt:c?.last_attempt_at||null,lastSuccessAt:c?.last_success_at||null,lastSyncCount:c?.last_sync_count??null,lastError:c?.last_error||null},{headers:{'Cache-Control':'private, no-store'}})}
 catch{return NextResponse.json({error:'COROS_STATUS_UNAVAILABLE'},{status:503});}
}
