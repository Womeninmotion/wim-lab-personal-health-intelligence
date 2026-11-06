import { NextResponse } from 'next/server';
import { getVerifiedOwner } from '@/lib/server-auth';
import { discoverOAuth,mcpEndpoint,publicOrigin } from '@/lib/coros-oauth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
  const owner=await getVerifiedOwner();
  if(!owner)return NextResponse.json({error:'unauthorized'},{status:401});
  try{
    const {metadata,metadataUrl,issuerOrigin}=await discoverOAuth();
    // Paths and hosts only; never output client credentials, state, code, token or query strings.
    const clean=(value:string)=>{const u=new URL(value);return u.origin+u.pathname};
    return NextResponse.json({discovery:'ok',region:mcpEndpoint,issuer:issuerOrigin,
      metadataSource:clean(metadataUrl),authorizationEndpoint:clean(metadata.authorization_endpoint),
      tokenEndpoint:clean(metadata.token_endpoint),registrationEndpoint:metadata.registration_endpoint?clean(metadata.registration_endpoint):null,
      callback:publicOrigin()+'/api/coros/callback',clientRegistrationSupported:!!metadata.registration_endpoint},
      {headers:{'Cache-Control':'no-store'}});
  }catch(e){return NextResponse.json({discovery:'failed',error:e instanceof Error?e.message:'COROS_DISCOVERY_FAILED',region:mcpEndpoint},{status:502,headers:{'Cache-Control':'no-store'}})}
}
