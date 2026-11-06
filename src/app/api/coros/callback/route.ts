import { NextRequest,NextResponse } from 'next/server';
import {decrypt,encrypt,exchangeToken,mcpEndpoint,publicOrigin,saveConnection, type OAuthClient} from '@/lib/coros-oauth';
export const runtime='nodejs';
type Pending={state:string;verifier:string;client:OAuthClient;tokenEndpoint:string;redirect:string;ownerId:string};
export async function GET(req:NextRequest){
  const back=new URL('/me',publicOrigin());
  const pending=req.cookies.get('wim_coros_pending')?.value;
  if(!pending) {back.searchParams.set('coros','session-expired');return NextResponse.redirect(back);}
  try {
    const p=decrypt<Pending>(pending);
    // Login cookie is SameSite=Strict, so it is not sent on the provider's cross-site redirect.
    // Authenticate this callback using a short-lived, encrypted, state-bound OAuth cookie instead.
    if(!process.env.HEALTH_OWNER_USER_ID||p.ownerId!==process.env.HEALTH_OWNER_USER_ID)throw new Error('OAUTH_OWNER_MISMATCH');
    if(!req.nextUrl.searchParams.get('code')||req.nextUrl.searchParams.get('state')!==p.state)throw new Error('OAUTH_STATE_MISMATCH');
    const form=new URLSearchParams({grant_type:'authorization_code',code:req.nextUrl.searchParams.get('code')!,redirect_uri:p.redirect,client_id:p.client.client_id,code_verifier:p.verifier});
    if(p.client.client_secret)form.set('client_secret',p.client.client_secret);
    const tokens=await exchangeToken(p.tokenEndpoint,form);
    await saveConnection({encrypted_credentials:encrypt({client:p.client,tokens,tokenEndpoint:p.tokenEndpoint,resource:mcpEndpoint}),mcp_endpoint:mcpEndpoint,auth_origin:publicOrigin(),connected_at:new Date().toISOString(),last_error:null});
    back.searchParams.set('coros','connected');
  }catch(e){back.searchParams.set('coros','connection-failed');
    // Do not put token exchange details, authorization codes or credentials into user-visible URLs.
    console.error('COROS OAuth callback failed',e instanceof Error?e.message:'unknown');}
  // A fresh same-site navigation after the provider redirect lets SameSite=Strict WIM login cookies work.
  // Redirect chains from an external OAuth site can otherwise display the login gate once.
  const target=back.toString();
  const html='<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url='+target.replace(/&/g,'&amp;')+'"></head><body><p>正在返回 WIM Lab…</p><a href="'+target.replace(/&/g,'&amp;')+'">返回 WIM Lab</a></body></html>';
  const out=new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
  out.cookies.set('wim_coros_pending','',{httpOnly:true,secure:true,sameSite:'lax',path:'/api/coros',maxAge:0});
  return out;
}
