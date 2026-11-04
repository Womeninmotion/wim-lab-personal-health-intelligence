"use client";

import { dataFreshness } from "@/data/demo";
import { useClientClock } from "@/lib/useClientDate";

export function MorningGreeting() {
  const clock = useClientClock();

  return (
    <header className="border-b border-line pb-8">
      <p className="inline-block bg-soft px-2 py-1 text-[11px] font-medium tracking-wide text-ink">
        DEMO · 示例数据
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {clock ? clock.greeting : "你好"}。先看昨天，再决定今天怎么动、怎么吃。
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-ink/80">
        {clock
          ? `现在是你的本地时间，${clock.dateText}（${clock.timeZone}）。`
          : "正在读取你的本地时间。"}
        这份简报用的是一位虚构人物：在家工作，晚饭常常外卖，晚上可能有一节已经排好的训练。数字不是你的体检或设备数据。
      </p>
      <dl className="mt-6 grid gap-4 border border-line bg-white p-4 sm:grid-cols-[auto_1fr] sm:gap-x-8">
        <dt lang="en" className="font-display text-[11px] font-semibold tracking-[0.16em] text-ink/50">
          STATUS
        </dt>
        <dd className="text-sm leading-6">
          <span className="font-medium">{dataFreshness.label}</span>
          <span className="text-ink/75"> · {dataFreshness.synced}</span>
          <span className="mt-1 block text-ink/70">{dataFreshness.detail}</span>
        </dd>
      </dl>
    </header>
  );
}
