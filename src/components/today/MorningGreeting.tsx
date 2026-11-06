"use client";

import { useClientClock } from "@/lib/useClientDate";
import { usePersonalGoals } from "@/lib/usePersonalGoals";
import { useCorosActivities } from "@/lib/useCorosActivities";

export function MorningGreeting() {
  const clock = useClientClock();
  const { goals } = usePersonalGoals();
  const coros = useCorosActivities();
  const greeting = clock?.greeting ?? "你好";
  return (
    <header className="pb-7 md:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-ink/55">YOUR HEALTH, IN CONTEXT</span>
        <span className="border border-orange/40 bg-orange/10 px-3 py-1 text-xs font-medium text-ink">小米 S800 · 已连接体重与身体成分</span>
      </div>
      <h1 className="mt-5 font-display text-[clamp(2rem,3.2vw,3.1rem)] font-bold leading-tight tracking-tight">
        {goals.displayName}，{greeting}。
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink/70">
        先看看目标走到哪儿，再回顾昨天，决定今天做什么。
      </p>
      <p className="mt-3 text-xs text-ink/55">{clock?.dateText ?? ""} · Mi Fitness 已入库；{coros.connectionStatus==='oauth_authorized'?'COROS 已授权，具体同步状态见 Me':'COROS 仅历史记录，自动同步待接入'}；RingConn 睡眠尚待接入本站。</p>
    </header>
  );
}
