'use client';
import {useCallback,useEffect,useState} from 'react';
export type CorosActivity={coros_label_id:string;sport_type:number;activity_type:string;started_at:string;distance_km:number;ascent_m:number|null;duration_seconds:number|null;imported_at:string;import_method:string};
export function useCorosActivities(){
 const [activities,setActivities]=useState<CorosActivity[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [lastImportAt,setLastImportAt]=useState<string|null>(null);
 const [lastSyncAt,setLastSyncAt]=useState<string|null>(null);
 const [connectionStatus,setConnectionStatus]=useState<'oauth_authorized'|'historical_import_only'>('historical_import_only');
 const reload=useCallback(async()=>{
  setLoading(true);setError('');
  try{const r=await fetch('/api/private/coros-activities',{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw new Error(r.status===401?'登录已过期':'COROS 记录读取失败');const data=await r.json();setActivities(Array.isArray(data.activities)?data.activities:[]);setLastImportAt(data.lastImportAt??null);setLastSyncAt(data.lastSyncAt??null);setConnectionStatus(data.connectionStatus==='oauth_authorized'?'oauth_authorized':'historical_import_only')}catch(e){setError(e instanceof Error?e.message:'网络异常')}finally{setLoading(false)}
 },[]);
 useEffect(()=>{void reload();const onFocus=()=>{if(document.visibilityState==='visible')void reload()};document.addEventListener('visibilitychange',onFocus);return()=>document.removeEventListener('visibilitychange',onFocus)},[reload]);
 return {activities,loading,error,lastImportAt,lastSyncAt,connectionStatus,reload};
}
export function shanghaiDate(d:Date){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const get=(type:string)=>p.find(x=>x.type===type)?.value??'';return `${get('year')}-${get('month')}-${get('day')}`;}
export function weeklyRunAndAscent(activities:CorosActivity[],date=new Date()){
 const day=shanghaiDate(date);
 const d=new Date(`${day}T12:00:00+08:00`);
 const monday=new Date(d.getTime()-((d.getUTCDay()+6)%7)*86400000);
 const start=shanghaiDate(monday);
 const active=activities.filter(a=>{
  const local=shanghaiDate(new Date(a.started_at));
  return local>=start&&local<=day;
 });
 const runs=active.filter(a=>[100,101,102,103].includes(a.sport_type));
 const runKm=runs.reduce((s,a)=>s+Number(a.distance_km||0),0);
 // Weekly climbing includes outdoor runs, trail runs and hikes. Hike distance is NOT counted in run volume.
 const ascentActivities=active.filter(a=>[100,102,103,104,105].includes(a.sport_type));
 const missingAscent=ascentActivities.some(a=>a.ascent_m==null);
 const ascentM=ascentActivities.reduce((s,a)=>s+(a.ascent_m==null?0:Number(a.ascent_m)),0);
 return {runKm,ascentM,missingAscent,weekStart:start,activities:active};
}

export function weekStartShanghai(date=new Date()):string {
 const day=shanghaiDate(date);
 const d=new Date(`${day}T12:00:00+08:00`);
 const monday=new Date(d.getTime()-((d.getUTCDay()+6)%7)*86400000);
 return shanghaiDate(monday);
}
export function priorWeekRunAndAscent(activities:CorosActivity[],date=new Date()) {
 return weeklyRunAndAscent(activities,new Date(date.getTime()-7*86400000));
}
export function isTrainingGoalActive(targetWeekStart:string|undefined,date=new Date()) {
 return Boolean(targetWeekStart && targetWeekStart===weekStartShanghai(date));
}
