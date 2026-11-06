'use client';
import {useEffect,useState} from 'react';
type State={connected:boolean;lastAttemptAt:string|null;lastSuccessAt:string|null;lastSyncCount:number|null;lastError:string|null};
export function CorosConnection(){
 const [info,setInfo]=useState<State|null>(null);const [working,setWorking]=useState(false);const [message,setMessage]=useState('');
 async function reload(){try{const r=await fetch('/api/private/coros/status',{cache:'no-store'});if(!r.ok)throw new Error('状态读取失败');setInfo(await r.json())}catch{setMessage('暂时无法读取 COROS 授权状态。')}}
 useEffect(()=>{void reload();const state=new URLSearchParams(location.search).get('coros');if(state==='connected')setMessage('授权已完成。点击“立即同步”拉取最近14天的训练。');else if(state)setMessage('授权未完成，请重试。')},[]);
 async function disconnect(){if(!window.confirm('确认断开 COROS 授权？已导入的历史训练会保留。'))return;setWorking(true);try{const r=await fetch('/api/private/coros/disconnect',{method:'POST'});if(!r.ok)throw new Error('断开失败');setMessage('COROS 已断开，历史训练仍保留在 WIM Lab。');await reload()}catch(e){setMessage(e instanceof Error?e.message:'断开失败')}finally{setWorking(false)}}
 async function sync(){setWorking(true);setMessage('正在从 COROS 查询最近14天训练…');try{const r=await fetch('/api/private/coros/sync',{method:'POST'});const j=await r.json();if(!r.ok)throw new Error(j.error||'同步失败');setMessage(`已查询并更新 ${j.synced} 条训练。请刷新 Today 查看进度。`);await reload()}catch(e){setMessage(e instanceof Error?e.message:'同步失败')}finally{setWorking(false)}}
 return <section className="max-w-3xl border border-line bg-white p-5 md:p-7" aria-label="COROS 同步设置">
  <p className="text-[11px] font-bold tracking-widest text-ink/55">DATA CONNECTION / COROS</p>
  <h2 className="mt-2 text-lg font-bold">连接与更新 COROS 训练</h2>
  <p className="mt-2 text-sm leading-6 text-ink/70">使用 COROS 官方 OAuth 授权，不在 WIM Lab 保存 COROS 密码。每次设备先同步到 COROS App，网站才能读取新的训练。</p>
  <p className="mt-3 text-sm">{info===null?'正在检测授权状态…':info.connected?'已连接 COROS · 可按需同步':'尚未授权连接 COROS'}</p>
  {info?.connected?<>
   <p className="mt-2 text-xs leading-6 text-ink/60">上次成功：{info.lastSuccessAt?new Date(info.lastSuccessAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):'尚未成功同步'} · 上次记录数 {info.lastSyncCount??'—'}</p>
   {info.lastError&&<p className="mt-2 text-xs text-red-700">最近同步错误：{info.lastError}</p>}
   <button type="button" disabled={working} onClick={()=>void sync()} className="mt-3 bg-orange px-4 py-2 text-sm font-semibold disabled:opacity-50">{working?'同步中…':'立即同步 COROS'}</button>
   <button type="button" disabled={working} onClick={()=>void disconnect()} className="ml-3 border border-line px-4 py-2 text-sm disabled:opacity-50">断开授权</button>
  </>:<a href="/api/private/coros/connect" className="mt-3 inline-block bg-orange px-4 py-2 text-sm font-semibold">连接我的 COROS</a>}
  <p aria-live="polite" className="mt-2 text-xs text-ink/70">{message}</p>
  <p className="mt-3 text-xs leading-6 text-ink/60">每日自动同步需要 Vercel Cron 运行成功后才可视为开通。COROS 个人 MCP 不提供 Webhook，不能承诺实时更新。</p>
 </section>;
}
