import {NextResponse} from 'next/server';
import {getVerifiedOwner} from '@/lib/server-auth';
import {baseEnv} from '@/lib/coros-oauth';
export const runtime='nodejs';
export async function POST(){
 if(!await getVerifiedOwner())return NextResponse.json({error:'unauthorized'},{status:401});
 try{const {base,key,owner}=baseEnv();const url=new URL('/rest/v1/coros_connections',base);url.searchParams.set('user_id','eq.'+owner);
 const res=await fetch(url,{method:'DELETE',headers:{apikey:key,Authorization:'Bearer '+key,Prefer:'return=minimal'},cache:'no-store'});
 if(!res.ok)throw new Error('DELETE_FAILED');return NextResponse.json({disconnected:true,historyRetained:true});}
 catch{return NextResponse.json({error:'COROS_DISCONNECT_FAILED'},{status:502});}
}
