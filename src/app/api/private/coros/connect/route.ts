import { NextResponse } from 'next/server';
import { getVerifiedOwner } from '@/lib/server-auth';
import { challenge,discover,encrypt,mcpEndpoint,publicOrigin,randomState,registerClient,verifier } from '@/lib/coros-oauth';
export const runtime='nodejs';
export async function GET(){
  const owner=await getVerifiedOwner();
  if(!owner)return NextResponse.json({error:'unauthorized'},{status:401});
  try {
    const redirect=publicOrigin()+'/api/coros/callback';
    const metadata=await discover();
    const client=await registerClient(metadata,redirect);
    const state=randomState(),v=verifier();
    const auth=new URL(metadata.authorization_endpoint);
    auth.searchParams.set('response_type','code');auth.searchParams.set('client_id',client.client_id);
    auth.searchParams.set('redirect_uri',redirect);auth.searchParams.set('state',state);
    auth.searchParams.set('code_challenge_method','S256');auth.searchParams.set('code_challenge',challenge(v));
    auth.searchParams.set('resource',mcpEndpoint);
    const out=NextResponse.redirect(auth);
    out.cookies.set('wim_coros_pending',encrypt({state,verifier:v,client,tokenEndpoint:metadata.token_endpoint,redirect,ownerId:owner.id}),{httpOnly:true,secure:true,sameSite:'lax',path:'/api/coros',maxAge:600});
    return out;
  }catch(e){return NextResponse.json({error:'COROS_CONNECT_FAILED',detail:e instanceof Error?e.message:'Unknown'}, {status:502});}
}
