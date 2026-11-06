import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const trustedMcp = new Set(['mcp.coros.com','mcpcn.coros.com','mcpeu.coros.com','mcpus.coros.com']);
export const mcpEndpoint = (() => {
  const u = new URL(process.env.COROS_MCP_URL || 'https://mcpcn.coros.com/mcp');
  if (u.protocol !== 'https:' || !trustedMcp.has(u.hostname) || u.pathname !== '/mcp') throw new Error('INVALID_COROS_MCP_ENDPOINT');
  return u.origin + '/mcp';
})();
export function publicOrigin() {
  const u = new URL(process.env.WIM_PUBLIC_ORIGIN || 'https://wim-lab-personal-health-intelligence.vercel.app');
  if (u.protocol !== 'https:') throw new Error('HTTPS_PUBLIC_ORIGIN_REQUIRED');
  return u.origin;
}
function encryptionKey() {
  const raw = process.env.COROS_ENCRYPTION_KEY;
  if (!raw || !/^[0-9a-f]{64}$/i.test(raw)) throw new Error('COROS_ENCRYPTION_KEY_MISSING');
  return Buffer.from(raw,'hex');
}
export function encrypt(obj:unknown):string {
  const iv=randomBytes(12);
  const c=createCipheriv('aes-256-gcm',encryptionKey(),iv);
  const ciphertext=Buffer.concat([c.update(JSON.stringify(obj),'utf8'),c.final()]);
  return Buffer.concat([iv,c.getAuthTag(),ciphertext]).toString('base64url');
}
export function decrypt<T>(encoded:string):T {
  const data=Buffer.from(encoded,'base64url');
  if(data.length<29) throw new Error('INVALID_CREDENTIALS');
  const d=createDecipheriv('aes-256-gcm',encryptionKey(),data.subarray(0,12));
  d.setAuthTag(data.subarray(12,28));
  return JSON.parse(Buffer.concat([d.update(data.subarray(28)),d.final()]).toString('utf8')) as T;
}
export function verifier() {return randomBytes(32).toString('base64url');}
export function challenge(v:string){return createHash('sha256').update(v).digest('base64url');}
export function randomState(){return randomBytes(24).toString('base64url');}
export type OAuthMetadata={authorization_endpoint:string;token_endpoint:string;registration_endpoint?:string;client_id_metadata_document_supported?:boolean};
export type OAuthClient={client_id:string;client_secret?:string;token_endpoint_auth_method?:string};
export type Tokens={access_token:string;refresh_token?:string;expires_in?:number;token_type?:string;expires_at?:number};
export type StoredCredentials={client:OAuthClient;tokens:Tokens;tokenEndpoint:string;resource:string};
export function baseEnv(){
  const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,owner=process.env.HEALTH_OWNER_USER_ID;
  if(!base||!key||!owner) throw new Error('DATABASE_NOT_CONFIGURED');
  return {base,key,owner};
}
function isTrustedCorosUrl(value:string){try{const u=new URL(value);return u.protocol==='https:' && (u.hostname==='coros.com'||u.hostname.endsWith('.coros.com'));}catch{return false;}}
export type DiscoveredOAuth = { metadata:OAuthMetadata; metadataUrl:string; issuerOrigin:string };
// Fail closed: never synthesize /authorize, /token or /register endpoints.
export async function discoverOAuth():Promise<DiscoveredOAuth> {
  const origin=new URL(mcpEndpoint).origin;
  const resourceUrls=[origin+'/.well-known/oauth-protected-resource/mcp',origin+'/.well-known/oauth-protected-resource'];
  const servers:string[]=[];
  for (const link of resourceUrls){
    try {
      const r=await fetch(link,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(7000)});
      if(!r.ok)continue;
      const j=await r.json() as {authorization_servers?:unknown};
      if(Array.isArray(j.authorization_servers)) for(const candidate of j.authorization_servers){
        if(typeof candidate==='string' && isTrustedCorosUrl(candidate) && !servers.includes(candidate)) servers.push(candidate);
      }
    } catch { /* Try the next official metadata URL. */ }
  }
  // Discovery is still allowed on the trusted region itself if protected-resource metadata is absent.
  if(!servers.includes(origin)) servers.push(origin);
  for(const issuer of servers){
    const parsed=new URL(issuer);
    const issuerPath=parsed.pathname.replace(/\/$/,'');
    const locations=[
      parsed.origin+'/.well-known/oauth-authorization-server'+issuerPath,
      parsed.origin+'/.well-known/oauth-authorization-server',
      parsed.origin+'/.well-known/openid-configuration'+issuerPath,
      parsed.origin+'/.well-known/openid-configuration',
    ];
    for(const addr of [...new Set(locations)]){
      try {
        const r=await fetch(addr,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(7000)});
        if(!r.ok)continue;
        const meta=await r.json() as OAuthMetadata;
        if(typeof meta.authorization_endpoint!=='string'||typeof meta.token_endpoint!=='string')continue;
        if(!isTrustedCorosUrl(meta.authorization_endpoint)||!isTrustedCorosUrl(meta.token_endpoint))continue;
        if(meta.registration_endpoint && !isTrustedCorosUrl(meta.registration_endpoint))continue;
        return {metadata:meta,metadataUrl:addr,issuerOrigin:parsed.origin};
      } catch { /* A malformed response must not become an invented OAuth URL. */ }
    }
  }
  throw new Error('COROS_OAUTH_METADATA_UNAVAILABLE');
}
// Backward-compatible narrow export for other call sites.
export async function discover():Promise<OAuthMetadata>{return (await discoverOAuth()).metadata;}
export async function registerClient(meta:OAuthMetadata, redirect:string):Promise<OAuthClient> {
  if (!meta.registration_endpoint || !isTrustedCorosUrl(meta.registration_endpoint)) throw new Error('COROS_OAUTH_REGISTRATION_UNAVAILABLE');
  const r=await fetch(meta.registration_endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_name:'WendyInMotion Private Health Lab',redirect_uris:[redirect],grant_types:['authorization_code','refresh_token'],response_types:['code'],token_endpoint_auth_method:'none'}),cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw new Error('COROS_CLIENT_REGISTRATION_'+r.status);
  const j=await r.json() as OAuthClient;
  if(!j.client_id) throw new Error('COROS_CLIENT_ID_MISSING');
  return j;
}
export async function exchangeToken(endpoint:string,body:URLSearchParams):Promise<Tokens>{
  if(!isTrustedCorosUrl(endpoint)) throw new Error('UNTRUSTED_COROS_TOKEN_ENDPOINT');
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw new Error('COROS_TOKEN_EXCHANGE_'+r.status);
  const j=await r.json() as Tokens;
  if(!j.access_token)throw new Error('COROS_ACCESS_TOKEN_MISSING');
  return {...j,expires_at:Date.now()+(Number(j.expires_in||2592000)*1000)};
}
export async function readConnection(){
  const {base,key,owner}=baseEnv();
  const url=new URL('/rest/v1/coros_connections',base);
  url.searchParams.set('select','*');url.searchParams.set('user_id','eq.'+owner);url.searchParams.set('limit','1');
  const r=await fetch(url,{headers:{apikey:key,Authorization:'Bearer '+key},cache:'no-store'});
  if(!r.ok)throw new Error('COROS_CONNECTION_READ_'+r.status);
  const rows=await r.json() as Array<Record<string,unknown>>;
  return rows[0]||null;
}
export async function saveConnection(record:Record<string,unknown>){
  const {base,key,owner}=baseEnv();
  const url=new URL('/rest/v1/coros_connections',base);url.searchParams.set('on_conflict','user_id');
  const r=await fetch(url,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:owner,...record,updated_at:new Date().toISOString()}),cache:'no-store'});
  if(!r.ok)throw new Error('COROS_CONNECTION_SAVE_'+r.status);
}
export async function patchConnection(fields:Record<string,unknown>){
  const {base,key,owner}=baseEnv();
  const url=new URL('/rest/v1/coros_connections',base);url.searchParams.set('user_id','eq.'+owner);
  const r=await fetch(url,{method:'PATCH',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({...fields,updated_at:new Date().toISOString()}),cache:'no-store'});
  if(!r.ok)throw new Error('COROS_CONNECTION_UPDATE_'+r.status);
}
export async function ensureToken(creds:StoredCredentials):Promise<StoredCredentials>{
  if((creds.tokens.expires_at||0)>Date.now()+5*60_000)return creds;
  if(!creds.tokens.refresh_token)throw new Error('COROS_REAUTHORIZE_REQUIRED');
  const params=new URLSearchParams({grant_type:'refresh_token',refresh_token:creds.tokens.refresh_token,client_id:creds.client.client_id});
  if(creds.client.client_secret)params.set('client_secret',creds.client.client_secret);
  const latest=await exchangeToken(creds.tokenEndpoint,params);
  const result={...creds,tokens:{...latest,refresh_token:latest.refresh_token||creds.tokens.refresh_token}};
  await patchConnection({encrypted_credentials:encrypt(result)});
  return result;
}
