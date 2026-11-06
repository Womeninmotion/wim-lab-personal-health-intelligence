"use client";
import Link from "next/link";
import { useCorosActivities, weeklyRunAndAscent, isTrainingGoalActive, weekStartShanghai } from "@/lib/useCorosActivities";
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
  const coros = useCorosActivities();
  const week = weeklyRunAndAscent(coros.activities);
  const runTarget = Number(goals.weeklyRunKm);
  const ascentTarget = Number(goals.weeklyAscentM);
  const hasRun = coros.activities.length>0 && !coros.loading && !coros.error;
  const weekActive=isTrainingGoalActive(goals.targetWeekStart);
  // Upcoming-week targets may be shown as a clearly labelled reference, not a current-week achievement.
  const showReference=Boolean(goals.targetWeekStart && goals.targetWeekStart>weekStartShanghai());
  const showComparison=weekActive || showReference;
  const currentWeekStart=weekStartShanghai();
  const targetsDefined=runTarget>0 && ascentTarget>0;
  const weekNote=goals.targetWeekStart
    ? weekActive ? '本周已确认目标' : goals.targetWeekStart>currentWeekStart ? `下周建议目标自 ${goals.targetWeekStart} 起生效；下方进度条只是对照参考，不是本周达成率` : `目标适用于 ${goals.targetWeekStart} 开始的一周，当前周需重新确认`
    : targetsDefined ? '目标尚未指定适用周，本周仅展示真实记录' : '下周训练建议可在 Me 中确认';
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
        <p className="mt-1 text-xs text-ink/55">本周实际训练（周一至今） · {weekNote}</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div><div className="flex flex-wrap justify-between gap-1 text-xs"><span className="text-ink/65">本周跑量</span><span className="font-medium">{hasRun ? `${week.runKm.toFixed(2)} km` : '—'}{showComparison && goals.weeklyRunKm ? ` / ${goals.weeklyRunKm} km` : ''}</span></div><MicroProgress percent={hasRun && showComparison && runTarget>0 ? week.runKm/runTarget*100 : null} label={showReference ? "本周跑量相对于下周建议的参考比例，不是本周达成率" : "本周跑量目标完成进度"} /></div>
          <div><div className="flex flex-wrap justify-between gap-1 text-xs"><span className="text-ink/65">本周爬升</span><span className="font-medium">{hasRun && !week.missingAscent ? `${Math.round(week.ascentM)} m+` : '—'}{showComparison && goals.weeklyAscentM ? ` / ${goals.weeklyAscentM} m+` : ''}</span></div><MicroProgress percent={hasRun && showComparison && !week.missingAscent && ascentTarget>0 ? week.ascentM/ascentTarget*100 : null} label={showReference ? "本周爬升相对于下周建议的参考比例，不是本周达成率" : "本周爬升目标完成进度"} /></div>
        </div>
        <p className="mt-2 text-xs leading-5 text-ink/55">{coros.error ? `COROS 记录读取失败：${coros.error}` : coros.loading ? "正在读取训练记录…" : hasRun ? `COROS 已入库 ${coros.activities.length} 条训练；${coros.connectionStatus==='oauth_authorized'?(coros.lastSyncAt?'最近一次官方授权同步已完成':'已授权但尚未成功同步'):'目前仅有历史回填，尚未官方授权同步'}。跑量仅统计跑步；爬升包含山地徒步。` : "尚无 COROS 训练记录；不能把未知进度当作零。"}</p>
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
