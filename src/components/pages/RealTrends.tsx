'use client';
import { latestOf, timeInShenzhen, usePrivateMeasurements } from '@/lib/usePrivateMeasurements';
const names: Record<string,string> = { weight_kg:'体重',body_fat_pct:'体脂率',lean_mass_kg:'瘦体重',bmi:'BMI' };
function WeightChart({values}:{values:{value:number;measured_at:string}[]}) {
  if(values.length<2) return <p className="mt-3 text-xs text-ink/60">需要至少两次可比测量才能画趋势。</p>;
  const ordered=[...values].reverse().slice(-30);
  const low=Math.min(...ordered.map(r=>r.value)),high=Math.max(...ordered.map(r=>r.value));
  const extent=Math.max(.3,high-low);
  const pts=ordered.map((r,i)=>`${(i/Math.max(1,ordered.length-1))*100},${92-((r.value-low)/extent)*80}`).join(' ');
  return <div className="mt-4"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-36 w-full" role="img" aria-label="最近体重变化折线图，包含实际测量记录，不做趋势预测"><polyline points={pts} fill="none" stroke="#EE793D" strokeWidth="1.7" vectorEffect="non-scaling-stroke" /></svg><p className="mt-1 text-xs text-ink/55">最近 {ordered.length} 次测量 · {low.toFixed(2)}–{high.toFixed(2)} kg · 不同时间称重需谨慎比较</p></div>;
}
export function RealTrends() {
  const { measurements,loading,error } = usePrivateMeasurements();
  const weights = measurements.filter(x=>x.metric_name === 'weight_kg').slice().reverse();
  const latest = latestOf(measurements,'weight_kg');
  const latestFat = latestOf(measurements,'body_fat_pct');
  return <section className="space-y-6">
    <header><p className="text-[11px] font-bold tracking-[0.2em] text-ink/60">REAL DATA / TRENDS</p><h1 className="mt-2 text-3xl font-bold">身体测量趋势</h1><p className="mt-3 text-sm text-ink/70">仅使用 Mi Fitness（小米 S800）的测量值，不混合 COROS 和薄荷健康来源。时间均为深圳时间。</p></header>
    {loading ? <p role="status">正在读取真实数据…</p> : error ? <p role="alert" className="border border-line bg-white p-5">{error}</p> : measurements.length === 0 ? <p className="border border-line bg-white p-5">暂时没有小米 S800 的测量记录。</p> : <>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="border border-line bg-white p-6"><p className="text-sm text-ink/60">最新体重</p><p className="mt-2 text-4xl font-bold">{latest ? latest.value.toFixed(2) : '—'} <span className="text-base font-normal">kg</span></p><p className="mt-2 text-xs text-ink/60">{latest ? timeInShenzhen(latest.measured_at) : '无记录'}</p></div>
        <div className="border border-line bg-white p-6"><p className="text-sm text-ink/60">最新体脂率（估算）</p><p className="mt-2 text-4xl font-bold">{latestFat ? latestFat.value.toFixed(1) : '—'}<span className="text-base font-normal">%</span></p><p className="mt-2 text-xs text-ink/60">{latestFat ? timeInShenzhen(latestFat.measured_at) : '无记录'}</p></div>
      </div>
      <div className="border border-line bg-white p-5 md:p-6"><h2 className="font-bold">体重趋势</h2><WeightChart values={weights.slice().reverse()}/><h3 className="mt-6 font-semibold">详细记录</h3><p className="mt-2 text-xs text-ink/60">不把早晚不同时间的称重变化直接解释成脂肪变化。</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-ink/60"><th className="py-3">测量时间</th><th>体重</th><th>来源</th></tr></thead><tbody>{weights.map((r,i)=><tr key={r.measured_at+i} className="border-b border-line"><td className="py-3">{timeInShenzhen(r.measured_at)}</td><td>{r.value.toFixed(2)} kg</td><td>小米 S800</td></tr>)}</tbody></table></div>
      </div>
      <div className="border border-line bg-white p-5"><h2 className="font-bold">其他身体测量</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{(['body_fat_pct','lean_mass_kg','bmi'] as const).map(k=>{const r=latestOf(measurements,k);return <div key={k}><p className="text-xs text-ink/60">{names[k]}</p><p className="mt-1 text-xl font-bold">{r ? `${r.value.toFixed(1)} ${k==='bmi'?'':r.unit}` : '—'}</p></div>})}</div></div>
    </>}
  </section>;
}
