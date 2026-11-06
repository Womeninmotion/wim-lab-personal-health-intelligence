import { NextResponse } from 'next/server';
import { getVerifiedOwner } from '@/lib/server-auth';
import { challenge,discoverOAuth,encrypt,mcpEndpoint,publicOrigin,randomState,registerClient,verifier } from '@/lib/coros-oauth';
export const runtime='nodejs';
export async function GET(){
  const owner=await getVerifiedOwner();
  if(!owner)return NextResponse.json({error:'unauthorized'},{status:401});
  try {
    const redirect=publicOrigin()+'/api/coros/callback';
    const {metadata}=await discoverOAuth();
    const client=await registerClient(metadata,redirect);
    const state=randomState(),v=verifier();
    const auth=new URL(metadata.authorization_endpoint);
    if (auth.search || auth.hash) throw new Error('COROS_OAUTH_ENDPOINT_UNEXPECTED_QUERY');
    auth.searchParams.set('response_type','code');auth.searchParams.set('client_id',client.client_id);
    auth.searchParams.set('redirect_uri',redirect);auth.searchParams.set('state',state);
    auth.searchParams.set('code_challenge_method','S256');auth.searchParams.set('code_challenge',challenge(v));
    auth.searchParams.set('resource',mcpEndpoint);
    const out=NextResponse.redirect(auth);
    out.cookies.set('wim_coros_pending',encrypt({state,verifier:v,client,tokenEndpoint:metadata.token_endpoint,redirect,ownerId:owner.id}),{httpOnly:true,secure:true,sameSite:'lax',path:'/api/coros',maxAge:600});
    return out;
  }catch(e){const code=e instanceof Error?e.message:'COROS_CONNECT_FAILED';
    const safe=/^COROS_[A-Z0-9_]+$/.test(code)?code:'COROS_CONNECT_FAILED';
    return NextResponse.json({error:safe,message:'未能安全开始 COROS 授权。请到 Me 查看诊断结果，不要反复输入账号密码。'}, {status:502});}
}
