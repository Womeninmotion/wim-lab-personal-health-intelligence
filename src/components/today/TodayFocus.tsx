"use client";

import { priorities } from "@/data/demo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppState } from "@/components/state/AppState";

export function TodayFocus() {
  const { openGuidance } = useAppState();
  return (
    <section aria-labelledby="focus-heading" className="mt-10">
      <SectionHeader id="focus-heading" en="TODAY" zh="今天怎么安排" />
      <p className="mb-4 text-sm text-ink/60">以下是生活方式场景示例，不是根据今天的实时健康数据生成的处方。</p>
      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
        {priorities.map((priority, index) => (
          <article key={priority.id} id={priority.id === "next-meal" ? "priority-meal" : undefined} className={`flex flex-col border p-5 ${index === 0 ? "border-orange bg-orange/10" : "border-line bg-white"}`}>
            <p className="font-display text-[11px] font-bold tracking-[0.15em] text-ink/50">{index === 0 ? "PRIMARY FOCUS" : `FOCUS 0${index + 1}`}</p>
            <h3 className="mt-3 font-display text-lg font-bold leading-7">{priority.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-7 text-ink/75">{priority.summary}</p>
            <button type="button" onClick={() => openGuidance(priority.id)} className="mt-4 self-start border-b-2 border-orange pb-1 text-sm font-semibold">看具体怎么做 →</button>
          </article>
        ))}
      </div>
    </section>
  );
}
