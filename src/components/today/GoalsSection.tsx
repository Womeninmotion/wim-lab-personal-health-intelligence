"use client";

import Link from "next/link";
import { daysUntil } from "@/lib/personalGoals";
import { usePersonalGoals } from "@/lib/usePersonalGoals";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { latestOf, timeInShenzhen, usePrivateMeasurements } from "@/lib/usePrivateMeasurements";

export function GoalsSection() {
  const { goals, ready } = usePersonalGoals();
  const days = ready ? daysUntil(goals.eventDate) : null;
  const stepGoal = Number(goals.dailySteps) || 8000;
  const { measurements, loading, error } = usePrivateMeasurements();
  const weight = latestOf(measurements, 'weight_kg');
  const fat = latestOf(measurements, 'body_fat_pct');
  const target = Number(goals.goalWeight);
  const difference = weight && Number.isFinite(target) && target > 0 ? weight.value - target : null;
  return (
    <section aria-labelledby="goals-heading" className="mb-8">
      <SectionHeader id="goals-heading" en="MY GOALS" zh="我的目标" />
      <div className="grid gap-3 lg:grid-cols-2">
        <article className="flex flex-col justify-between border border-line bg-white p-5 md:p-6">
          <div>
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold tracking-wide text-ink/60">01 · 越野备赛</span><span className="text-xs text-ink/55">重要长期目标</span></div>
            <h3 className="mt-3 font-display text-xl font-bold">{goals.eventName}</h3>
            <p className="mt-4 font-display text-4xl font-bold tracking-tight text-ink">
              {days === null ? "待确认" : days >= 0 ? `${days} 天` : "赛事已过"}
            </p>
            <p className="mt-1 text-sm text-ink/65">{days === null ? "填写比赛日期后，自动显示倒计时" : `比赛日期：${goals.eventDate}`}</p>
          </div>
          <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-ink/70">跑量、爬升、力量训练和恢复进度将在真实训练数据接入后展示。</p>
        </article>
        <article className="flex flex-col justify-between border border-line bg-white p-5 md:p-6">
          <div>
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold tracking-wide text-ink/60">02 · 减重与身体成分</span><span className="text-xs text-ink/55">与备赛共同管理</span></div>
            <h3 className="mt-3 font-display text-xl font-bold">稳步减重，不牺牲训练恢复</h3>
            <p className="mt-4 font-display text-4xl font-bold tracking-tight">{goals.goalWeight || "—"}<span className="ml-2 text-base font-medium text-ink/60">kg 目标</span></p>
            <p className="mt-2 text-sm font-semibold text-ink">{loading ? '正在读取最新体重…' : error ? error : weight ? `实测 ${weight.value.toFixed(2)} kg · ${timeInShenzhen(weight.measured_at)}（深圳时间）` : '暂无小米 S800 体重记录'}</p>
            {weight && <p className="mt-1 text-sm text-ink/65">{difference === null ? '请确认目标体重' : difference > 0 ? `距离目标还差 ${difference.toFixed(2)} kg` : difference === 0 ? '已达到当前体重目标' : `较目标低 ${Math.abs(difference).toFixed(2)} kg`} · 体脂率 {fat ? `${fat.value.toFixed(1)}%` : '待同步'}</p>}
          </div>
          <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-ink/70">小米 S800 · Mi Fitness。单次体脂估算存在波动；训练备赛期间不根据短期变化建议快速减重。</p>
        </article>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-line bg-white px-5 py-4">
        <div><p className="text-sm font-semibold">日常活动目标 · {stepGoal.toLocaleString("zh-CN")} 步/天</p><p className="mt-1 text-xs text-ink/65">在家办公时，训练课程不等于全天活动量。真实达标率待同步。</p></div>
        <Link href="/me" className="border-b-2 border-orange pb-1 text-sm font-semibold">编辑我的目标 →</Link>
      </div>
    </section>
  );
}
