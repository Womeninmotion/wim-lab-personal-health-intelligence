"use client";

import Link from "next/link";
import { daysUntil } from "@/lib/personalGoals";
import { usePersonalGoals } from "@/lib/usePersonalGoals";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function GoalsSection() {
  const { goals, ready } = usePersonalGoals();
  const days = ready ? daysUntil(goals.eventDate) : null;
  const stepGoal = Number(goals.dailySteps) || 8000;
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
            <p className="mt-1 text-sm text-ink/65">最新体重未同步 · 剩余差距暂无法计算</p>
          </div>
          <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-ink/70">待同步体重与体成分趋势后，评估减重速度是否影响 50K 备赛。</p>
        </article>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-line bg-white px-5 py-4">
        <div><p className="text-sm font-semibold">日常活动目标 · {stepGoal.toLocaleString("zh-CN")} 步/天</p><p className="mt-1 text-xs text-ink/65">在家办公时，训练课程不等于全天活动量。真实达标率待同步。</p></div>
        <Link href="/me" className="border-b-2 border-orange pb-1 text-sm font-semibold">编辑我的目标 →</Link>
      </div>
    </section>
  );
}
