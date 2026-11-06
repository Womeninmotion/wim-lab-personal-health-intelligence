"use client";
import Link from "next/link";
import {GoalsSection} from "@/components/today/GoalsSection";
import {MorningGreeting} from "@/components/today/MorningGreeting";
import {latestOf,timeInShenzhen,usePrivateMeasurements} from "@/lib/usePrivateMeasurements";
import {usePersonalGoals} from "@/lib/usePersonalGoals";
function daysSince(iso:string) { return Math.max(0, Math.floor((Date.now()-new Date(iso).getTime())/86400000)); }
export function TodayView() {
  const {measurements,loading,error,reload,lastIngestAt} = usePrivateMeasurements();
  const {goals} = usePersonalGoals();
  const weight=latestOf(measurements,'weight_kg');
  const fat=latestOf(measurements,'body_fat_pct');
  const age = weight ? daysSince(weight.measured_at) : null;
  const wGoal=Number(goals.goalWeight);
  const outstanding=weight && Number.isFinite(wGoal)&&wGoal>0 ? weight.value-wGoal:null;
  return <div className="max-w-[970px]">
    <MorningGreeting/>
    <GoalsSection measurements={measurements} loading={loading} error={error}/>
    <section className="max-w-3xl pb-6" aria-labelledby="daily-point">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-ink/55">TODAY · 先看这一件事</p>
      <h2 id="daily-point" className="mt-2 font-display text-xl font-bold leading-8">先确保数据是新的，再判断是否要调整计划。</h2>
      <p className="mt-2 text-sm leading-7 text-ink/75">{error ? '健康数据暂时读取失败，今天不依据旧记录推断状态。' : !weight ? '还没有收到小米 S800 的身体测量数据。' : age!==null && age >= 2 ? `目前最近的称重来自${timeInShenzhen(weight.measured_at)}。这不代表今天没有称重，只说明网站还没有收到更新。` : outstanding!==null && outstanding>0 ? `最新体重距离 ${wGoal} kg 目标还差 ${outstanding.toFixed(2)} kg。体重和${fat?'体脂率':'身体成分'}需要看连续趋势，50K备赛期间不建议凭单次波动追赶减重速度。` : '近期体重已达到设置目标；备赛阶段仍需要结合训练负荷与恢复判断是否需要调整。'}</p>
      <p className="mt-2 text-xs leading-6 text-ink/55">判断依据：已存储的 Mi Fitness 测量和你确认的个人目标。没有 COROS 训练、RingConn 睡眠、饮食和日程数据时，不生成综合恢复结论。</p>
    </section>
    <div className="grid gap-4 border-t border-line py-5 md:grid-cols-[1fr_1fr]">
      <section><h2 className="text-sm font-semibold">最新记录</h2><p className="mt-2 text-sm leading-6 text-ink/70">{loading ? '正在读取…' : weight ? `体重 ${weight.value.toFixed(2)} kg${fat ? ` · 体脂率 ${fat.value.toFixed(1)}%` : ''}，测量于 ${timeInShenzhen(weight.measured_at)}。` : '尚无可读取记录。'}</p><button onClick={()=>void reload()} className="mt-3 text-sm font-semibold underline decoration-orange underline-offset-4" disabled={loading}>{loading?'正在更新…':'刷新最新数据'}</button><span className="ml-3 text-xs text-ink/55">只刷新数据库；不会主动唤醒手机同步</span></section>
      <section><h2 className="text-sm font-semibold">下一步值得准备</h2><p className="mt-2 text-sm leading-6 text-ink/70">跑量、爬升和睡眠尚未进入本站的数据链路。训练目标可以先在 <Link className="underline decoration-orange" href="/me">Me</Link> 确认；实际完成情况要等 COROS 连接后再计算。</p></section>
    </div>
    <section className="border-t border-line py-4" aria-label="数据源连接状态">
      <h2 className="text-xs font-semibold tracking-wide text-ink/60">数据覆盖与更新时间</h2>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2"><p><strong>小米 S800</strong> · {weight ? `测量 ${timeInShenzhen(weight.measured_at)}` : '暂无数据'} · {lastIngestAt ? `入库 ${timeInShenzhen(lastIngestAt)}` : '尚未确认上传时间'}</p><p><strong>COROS</strong> · 运动详情尚未接入本网站</p><p><strong>RingConn</strong> · 睡眠尚未接入本网站</p><p><strong>日常活动 · {goals.dailySteps || '8000'}步/天</strong> · 步数尚未接入本站</p><p><strong>Google Calendar / 饮食</strong> · 尚未建立跨设备数据读取</p></div>
    </section>
  </div>;
}
