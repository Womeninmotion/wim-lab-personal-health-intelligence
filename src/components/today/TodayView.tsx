"use client";
import Link from "next/link";
import {GoalsSection} from "@/components/today/GoalsSection";
import {MorningGreeting} from "@/components/today/MorningGreeting";
import {latestOf,timeInShenzhen,usePrivateMeasurements} from "@/lib/usePrivateMeasurements";
import {usePersonalGoals} from "@/lib/usePersonalGoals";
import {useCorosActivities,weeklyRunAndAscent,priorWeekRunAndAscent,isTrainingGoalActive,weekStartShanghai} from "@/lib/useCorosActivities";
function daysSince(iso:string) { return Math.max(0, Math.floor((Date.now()-new Date(iso).getTime())/86400000)); }
export function TodayView() {
  const {measurements,loading,error,reload,lastIngestAt} = usePrivateMeasurements();
  const {goals} = usePersonalGoals();
  const coros=useCorosActivities();
  const thisWeek=weeklyRunAndAscent(coros.activities);
  const previous=priorWeekRunAndAscent(coros.activities);
  const latestTraining=coros.activities[0];
  const trainingKnown=!coros.loading&&!coros.error&&coros.activities.length>0;
  const hasActiveTarget=isTrainingGoalActive(goals.targetWeekStart);
  const lastImportDays=coros.lastImportAt?daysSince(coros.lastImportAt):null;
  const trainingAge=latestTraining?daysSince(latestTraining.started_at):null;
  const currentWeek=weekStartShanghai();
  const weekRunTarget=Number(goals.weeklyRunKm)||0;
  const targetIsNext=Boolean(goals.targetWeekStart&&goals.targetWeekStart>currentWeek);
  const evidence="依据：COROS 已入库活动（跑量与爬升）及 Mi Fitness 身体测量；未接入本站的睡眠、饮食和体检结论不用于推断当天恢复情况。";
  const mainTitle=coros.error?'训练记录读取受阻，暂不调整训练目标。':
    trainingKnown&&targetIsNext?'下周目标已提出，先完成本周的训练与恢复评估。':
    trainingKnown&&hasActiveTarget&&weekRunTarget>0&&thisWeek.runKm>=weekRunTarget?'本周跑量目标已达成，优先检查恢复而非继续加量。':
    trainingKnown&&trainingAge!==null&&trainingAge>=7?'最近的已入库跑步记录距今超过一周，先检查同步完整性。':
    trainingKnown?'先建立稳定跑步节奏，再逐步增加山地专项训练。':
    '先确认训练记录的覆盖情况，再制定今天的运动建议。';
  const mainText=coros.error?'无法读取已导入训练记录；请检查数据接口。':
    coros.loading?'正在读取 COROS 历史训练记录…':
    trainingKnown?`本周已记录跑步 ${thisWeek.runKm.toFixed(2)} km${thisWeek.missingAscent?'；部分训练缺少爬升值':`、累计爬升 ${Math.round(thisWeek.ascentM)} m+`}。上周记录跑步 ${previous.runKm.toFixed(2)} km。${targetIsNext?`${goals.weeklyRunKm || "—"} km 和 ${goals.weeklyAscentM || "—"} m+ 的目标适用于 ${goals.targetWeekStart} 开始的一周，不应算作本周已确认目标。`:hasActiveTarget?'已确认本周目标，进度按实际活动计算。':'本周尚无已确认的训练目标周。'}${lastImportDays!==null&&lastImportDays>=2?' 最近一次入库已超过48小时，不能推断之后没有运动。':coros.connectionStatus==='oauth_authorized'?' COROS 已授权；请检查最近一次成功同步时间确认数据覆盖。':' 数据来自历史回填，尚非自动同步。'}`:
    '本站尚无可验证的 COROS 活动记录；不以缺失数据推断你没有训练。';
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
      <h2 id="daily-point" className="mt-2 font-display text-xl font-bold leading-8">{mainTitle}</h2>
      <p className="mt-2 text-sm leading-7 text-ink/75">{mainText}</p>
      {weight && <p className="mt-2 text-sm leading-7 text-ink/75">最近体重 {weight.value.toFixed(2)} kg{fat?`、体脂率 ${fat.value.toFixed(1)}%`:''}。{age!==null && age>=2?`记录时间为 ${timeInShenzhen(weight.measured_at)}，当前无法确认是否有更新。`:outstanding!==null && outstanding>0?`距 ${wGoal} kg 目标 ${outstanding.toFixed(2)} kg；备赛期间不宜因单次称重而大幅减少进食。`:'训练期仍应关注能量供应和恢复。'}</p>}
      <p className="mt-2 text-xs leading-6 text-ink/55">{evidence}</p>
    </section>
    <div className="grid gap-4 border-t border-line py-5 md:grid-cols-[1fr_1fr]">
      <section><h2 className="text-sm font-semibold">最新记录</h2><p className="mt-2 text-sm leading-6 text-ink/70">{loading ? '正在读取…' : weight ? `体重 ${weight.value.toFixed(2)} kg${fat ? ` · 体脂率 ${fat.value.toFixed(1)}%` : ''}，测量于 ${timeInShenzhen(weight.measured_at)}。` : '尚无可读取记录。'}</p><button onClick={()=>void reload()} className="mt-3 text-sm font-semibold underline decoration-orange underline-offset-4" disabled={loading}>{loading?'正在更新…':'刷新最新数据'}</button><span className="ml-3 text-xs text-ink/55">只刷新数据库；不会主动唤醒手机同步</span></section>
      <section><h2 className="text-sm font-semibold">下一步值得准备</h2><p className="mt-2 text-sm leading-6 text-ink/70">COROS 入库记录可计算跑量与爬升；请检查 Me 中的授权和同步状态。下周训练建议与适用日期请在 <Link className="underline decoration-orange" href="/me">Me</Link> 确认；之后应优先完成增量同步和睡眠数据接入。</p></section>
    </div>
    <section className="border-t border-line py-4" aria-label="数据源连接状态">
      <h2 className="text-xs font-semibold tracking-wide text-ink/60">数据覆盖与更新时间</h2>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2"><p><strong>小米 S800</strong> · {weight ? `测量 ${timeInShenzhen(weight.measured_at)}` : '暂无数据'} · {lastIngestAt ? `入库 ${timeInShenzhen(lastIngestAt)}` : '尚未确认上传时间'}</p><p><strong>COROS</strong> · {coros.loading?"读取中":coros.error?"读取失败":trainingKnown?`已入库 ${coros.activities.length} 条活动；最近入库 ${coros.lastImportAt?timeInShenzhen(coros.lastImportAt):"未知"}；${coros.connectionStatus==='oauth_authorized'?`已授权 · 最近成功同步 ${coros.lastSyncAt?timeInShenzhen(coros.lastSyncAt):"尚无"}`:"仅历史导入"}`:"暂无已导入活动"}</p><p><strong>RingConn</strong> · 睡眠尚未接入本网站</p><p><strong>日常活动 · {goals.dailySteps || '8000'}步/天</strong> · 步数尚未接入本站</p><p><strong>Google Calendar / 饮食</strong> · 尚未建立跨设备数据读取</p></div>
    </section>
  </div>;
}
