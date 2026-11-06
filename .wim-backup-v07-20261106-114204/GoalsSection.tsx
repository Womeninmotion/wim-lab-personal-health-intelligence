"use client";
import Link from "next/link";
import { daysUntil, weightGoalProgress } from "@/lib/personalGoals";
import { usePersonalGoals } from "@/lib/usePersonalGoals";
import { latestOf, timeInShenzhen, type Measurement } from "@/lib/usePrivateMeasurements";

function MicroProgress({ percent, label }: { percent: number | null; label: string }) {
  return <div className="mt-2" aria-label={label}>
    <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#eee8e2]">
      {percent !== null && <div className="h-full rounded-full bg-[#EE793D]" style={{width:`${Math.max(0,Math.min(100,percent))}%`}} />}
    </div>
  </div>;
}
function ProgressValue({ current, start, target, unit }: {current: number|undefined; start: number; target: number; unit: string}) {
  const progress = current !== undefined ? weightGoalProgress(start,current,target) : null;
  return <>
    <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <span className="font-display text-lg font-semibold tabular-nums">{current === undefined ? "—" : current.toFixed(unit === 'kg' ? 2 : 1)} <span className="text-xs font-normal text-ink/60">{unit}</span></span>
      <span className="text-xs text-ink/65">目标 {Number.isFinite(target) && target>0? `${target} ${unit}` : '未设定'}</span>
    </div>
    <MicroProgress percent={progress?.percent ?? null} label={`目标完成度 ${progress?.percent.toFixed(0) ?? '待设定'}%`} />
    <p className="mt-1.5 text-xs leading-5 text-ink/65">{progress ? `完成 ${progress.percent.toFixed(0)}% · 已改善 ${Math.max(0,progress.lost).toFixed(unit === 'kg'?2:1)} ${unit}${unit==='%'?'（百分点）':''} · 还差 ${progress.remaining.toFixed(unit==='kg'?2:1)} ${unit}${unit==='%'?'（百分点）':''}` : '需在 Me 中设定起点和目标，才能计算进度'}</p>
  </>;
}
export function GoalsSection({measurements,loading,error}:{measurements:Measurement[];loading:boolean;error:string}) {
  const {goals,ready} = usePersonalGoals();
  const days = ready ? daysUntil(goals.eventDate) : null;
  const weight=latestOf(measurements,'weight_kg');
  const fat=latestOf(measurements,'body_fat_pct');
  const weightStart=goals.startWeight?Number(goals.startWeight):NaN;
  const fatStart=goals.startBodyFat?Number(goals.startBodyFat):NaN;
  const goalWeight=goals.goalWeight?Number(goals.goalWeight):NaN;
  const fatTarget=goals.goalBodyFat?Number(goals.goalBodyFat):NaN;
  return <section className="mb-7 border-y border-line py-4" aria-label="我的核心目标进度">
    <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">我的目标 <span className="ml-1 text-xs font-normal text-ink/50">/ GOAL PROGRESS</span></h2><Link className="text-xs underline decoration-orange underline-offset-4" href="/me">调整目标</Link></div>
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="lg:border-r lg:border-line lg:pr-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-semibold">{goals.eventName || 'UTMB 50K'}</h3><span className="text-sm font-semibold">{days===null ? '赛期未设定' : days>=0 ? `还有 ${days} 天` : '赛事日期已过'}</span></div>
        <p className="mt-1 text-xs text-ink/55">跑量与爬升，比时间倒计时更能反映备赛执行</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div><div className="flex flex-wrap justify-between gap-1 text-xs"><span className="text-ink/65">本周跑量</span><span className="font-medium">— / {goals.weeklyRunKm ? `${goals.weeklyRunKm} km` : '未设目标'}</span></div><MicroProgress percent={null} label="跑量未接入" /></div>
          <div><div className="flex flex-wrap justify-between gap-1 text-xs"><span className="text-ink/65">本周爬升</span><span className="font-medium">— / {goals.weeklyAscentM ? `${goals.weeklyAscentM} m` : '未设目标'}</span></div><MicroProgress percent={null} label="爬升未接入" /></div>
        </div>
        <p className="mt-2 text-xs leading-5 text-ink/55">COROS 运动记录尚未接入本站，实际值和进度不推测、不填零。</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold">体重与体脂 <span className="ml-1 text-xs font-normal text-ink/50">小米 S800</span></h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-ink/60">体重</p><ProgressValue current={weight?.value} start={weightStart} target={goalWeight} unit="kg"/></div>
          <div><p className="text-xs text-ink/60">体脂率（设备估算）</p><ProgressValue current={fat?.value} start={fatStart} target={fatTarget} unit="%"/></div>
        </div>
        <p className="mt-2 text-xs text-ink/55">{loading?'正在读取最新数据…':error?`读取异常：${error}`: weight?`最近称重：${timeInShenzhen(weight.measured_at)} · Mi Fitness`:'暂未收到称重数据'}。单次体脂波动不等于脂肪增减。</p>
      </div>
    </div>
  </section>;
}
