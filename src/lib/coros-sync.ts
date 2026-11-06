import 'server-only';
import {decrypt,ensureToken,readConnection,patchConnection,baseEnv,type StoredCredentials} from './coros-oauth';

type Activity={coros_label_id:string;sport_type:number;activity_type:string;started_at:string;distance_km:number;ascent_m:number|null;duration_seconds:number|null;import_method:string};
function safeDate(n:string){const date=new Date(n+'T12:00:00+08:00');return Number.isFinite(date.getTime())?date.toISOString():null;}
function hmsToSec(str:string){const p=str.split(':').map(Number);return p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:null;}
/** COROS MCP may return a plain string, a JSON-quoted string, or a text wrapper. */
export function normalizeCorosText(input:string):string {
  let value=input.trim();
  for(let i=0;i<3;i++){
    try {
      const parsed=JSON.parse(value) as unknown;
      if(typeof parsed==='string'){value=parsed.trim();continue;}
      if(parsed && typeof parsed==='object'){
        const o=parsed as Record<string,unknown>;
        const inner=o.text??o.content??o.result??o.data;
        if(typeof inner==='string'){value=inner.trim();continue;}
        if(Array.isArray(inner)){
          const texts=inner.flatMap(x=>x&&typeof x==='object'&&typeof (x as {text?:unknown}).text==='string'?[(x as {text:string}).text]:[]);
          if(texts.length){value=texts.join('\n');continue;}
        }
      }
    }catch{}
    break;
  }
  // A few MCP proxies escape line breaks without quoting the enclosing string.
  if(!value.includes('\n')&&value.includes('\\n'))value=value.replace(/\\r\\n|\\n/g,'\n');
  return value.replace(/\r\n/g,'\n');
}
export function parseList(raw:string):Activity[]{
  const text=normalizeCorosText(raw);
  const blocks=text.split(/\n(?=\d+\.\s)/);
  const result:Activity[]=[];
  for(const block of blocks){
    const header=block.match(/^\d+\.\s+(.+?)\s+[—–-]\s+(\d{4}-\d\d-\d\d)/m);
    const id=block.match(/LabelId:\s*(\d+)/i)?.[1];
    const sport=Number(block.match(/SportType:\s*(\d+)/i)?.[1]);
    const km=block.match(/Distance:\s*([\d.]+)\s*(km|m)\b/i);
    const start=block.match(/startTimestamp=(\d+)/i)?.[1];
    if(!header||!id||!Number.isInteger(sport)||!km)continue;
    const started=start?new Date(Number(start)*1000).toISOString():safeDate(header[2]);
    if(!started)continue;
    const distance=Number(km[1])*(km[2].toLowerCase()==='m'?0.001:1);
    const duration=block.match(/Duration:\s*(\d{1,3}:\d\d(?::\d\d)?)/i)?.[1];
    if(!Number.isFinite(distance)||distance<0||distance>1000)continue;
    result.push({coros_label_id:id,sport_type:sport,activity_type:header[1].trim(),started_at:started,distance_km:Math.round(distance*1000)/1000,ascent_m:null,duration_seconds:duration?hmsToSec(duration):null,import_method:'mcp_oauth'});
  }
  return result;
}
export function parseAscent(text:string):number|null{
 const m=text.match(/Elevation Gain\s*\/\s*Loss:\s*([\d,.]+)\s*m\s*\//i) || text.match(/Elevation Gain:\s*([\d,.]+)\s*m\b/i);
 if(!m)return null;
 const n=Number(m[1].replace(/,/g,''));return Number.isFinite(n)&&n>=0&&n<20000?n:null;
}
async function mcpCall(token:string,method:string,params:Record<string,unknown>,sessionId?:string){
  const url=(await import('./coros-oauth')).mcpEndpoint;
  const headers:Record<string,string>={'Authorization':'Bearer '+token,'Content-Type':'application/json','Accept':'application/json, text/event-stream','MCP-Protocol-Version':'2025-06-18'};
  if(sessionId)headers['Mcp-Session-Id']=sessionId;
  const res=await fetch(url,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:Math.floor(Math.random()*999999)+1,method,params}),cache:'no-store',signal:AbortSignal.timeout(25000)});
  if(!res.ok)throw new Error(`COROS_MCP_${res.status}`);
  const newSession=res.headers.get('mcp-session-id')||sessionId;
  const body=await res.text();
  let payload:unknown;
  if(res.headers.get('content-type')?.includes('text/event-stream')){
    const messages=body.split(/\n\n/).flatMap(s=>s.split('\n').filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trim()));
    const last=messages.filter(x=>x.startsWith('{')).at(-1);if(!last)throw new Error('COROS_MCP_EMPTY_SSE');payload=JSON.parse(last);
  }else{payload=JSON.parse(body);}
  const obj=payload as {error?:{message?:string};result?:{content?:Array<{type:string;text?:string}>;isError?:boolean}};
  if(obj.error||obj.result?.isError)throw new Error('COROS_MCP_TOOL_ERROR_'+(obj.error?.message||''));
  const texts=(obj.result?.content||[]).filter(x=>x.type==='text').map(x=>x.text||'');
  // Structured MCP responses may omit content[]; do not treat them as an empty activity list.
  const structured=(obj.result as {structuredContent?:unknown}|undefined)?.structuredContent;
  const raw=texts.length?texts.join('\n'):structured?JSON.stringify(structured):'';
  if(!raw.trim())throw new Error('COROS_MCP_TOOL_EMPTY_RESPONSE');
  return {text:normalizeCorosText(raw),sessionId:newSession};
}
async function sessions(creds:StoredCredentials){
  const init=await mcpCall(creds.tokens.access_token,'initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'WendyInMotion Lab',version:'0.8.0'}});
  // MCP protocol initialization notification can return HTTP 202 with no JSON body.
  const headers:Record<string,string>={'Authorization':'Bearer '+creds.tokens.access_token,'Content-Type':'application/json','MCP-Protocol-Version':'2025-06-18','Accept':'application/json, text/event-stream'};
  if(init.sessionId)headers['Mcp-Session-Id']=init.sessionId;
  await fetch((await import('./coros-oauth')).mcpEndpoint,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'}),cache:'no-store',signal:AbortSignal.timeout(7000)}).catch(()=>null);
  return init.sessionId;
}
export async function syncCoros(){
  const conn=await readConnection();if(!conn)return {connected:false,synced:0,message:'请先在 Me 连接 COROS'};
  const now=new Date().toISOString();
  await patchConnection({last_attempt_at:now,last_error:null});
  try{
    const creds=await ensureToken(decrypt<StoredCredentials>(String(conn.encrypted_credentials)));
    const session=await sessions(creds);
    const today=new Date();const start=new Date(today.getTime()-14*86400000);
    const format=(d:Date)=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const part=(k:string)=>p.find(x=>x.type===k)?.value||'';return part('year')+part('month')+part('day')};
    const list=await mcpCall(creds.tokens.access_token,'tools/call',{name:'querySportRecords',arguments:{startDate:format(start),endDate:format(today),sportTypeCodes:[100,101,102,103,104,105],limit:25}},session);
    const normalized=normalizeCorosText(list.text);
    const entries=parseList(normalized);let detailed=0;
    // A valid empty result must be explicit; any unrecognized/partial response is a failed sync.
    const reported=normalized.match(/(?:Sport Records[^\n]*?\(|\()\s*(\d+)\s+records?\s*\)/i);
    const expected=reported?Number(reported[1]):null;
    if(expected!==null && entries.length!==expected)throw new Error(`COROS_RECORD_PARSE_MISMATCH_${entries.length}_OF_${expected}`);
    const explicitEmpty=/(?:\b0\s+records?\b|no\s+(?:sport\s+)?(?:records|activities)\s+(?:found|available)|no\s+(?:matching\s+)?(?:records|activities))/i.test(normalized);
    if(entries.length===0 && !explicitEmpty)throw new Error('COROS_RECORD_RESPONSE_UNRECOGNIZED');
    const {base,key,owner}=baseEnv();
    const existingUrl=new URL('/rest/v1/coros_activities',base);
    existingUrl.searchParams.set('select','coros_label_id,ascent_m');
    existingUrl.searchParams.set('user_id','eq.'+owner);
    const existingRes=await fetch(existingUrl,{headers:{apikey:key,Authorization:'Bearer '+key},cache:'no-store'});
    if(!existingRes.ok)throw new Error('COROS_EXISTING_ACTIVITY_READ_'+existingRes.status);
    const known=new Map((await existingRes.json() as Array<{coros_label_id:string;ascent_m:number|null}>).map(a=>[a.coros_label_id,a.ascent_m]));
    const alreadyKnown=entries.filter(a=>known.has(a.coros_label_id)).length;
    const newlyFound=entries.length-alreadyKnown;
    // Only fetch details when elevation is not known. This reduces API load and Vercel duration.
    const needDetail=entries.filter(a=>known.get(a.coros_label_id)==null);
    for(let i=0;i<needDetail.length;i+=4){
      await Promise.all(needDetail.slice(i,i+4).map(async a=>{
        try{const detail=await mcpCall(creds.tokens.access_token,'tools/call',{name:'getActivityDetail',arguments:{labelId:a.coros_label_id,sportType:a.sport_type}},session);
          a.ascent_m=parseAscent(detail.text);detailed++;
        }catch{a.ascent_m=null;}
      }));
    }
    for(const a of entries)if(a.ascent_m===null&&known.has(a.coros_label_id))a.ascent_m=known.get(a.coros_label_id)??null;
    if(entries.length){
      const url=new URL('/rest/v1/coros_activities',base);url.searchParams.set('on_conflict','user_id,coros_label_id');
      const db=await fetch(url,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(entries.map(a=>({...a,user_id:owner,imported_at:now}))),cache:'no-store'});
      if(!db.ok)throw new Error('COROS_ACTIVITY_SAVE_'+db.status);
    }
    await patchConnection({last_success_at:now,last_sync_count:entries.length,last_error:null});
    return {connected:true,synced:entries.length,fetched:entries.length,newRecords:newlyFound,existingRecords:alreadyKnown,detailsFetched:detailed,rangeDays:14,at:now};
  }catch(e){const message=e instanceof Error?e.message:'UNKNOWN_SYNC_FAILURE';
    await patchConnection({last_error:message.slice(0,160)}).catch(()=>{});
    throw new Error(message);
  }
}
