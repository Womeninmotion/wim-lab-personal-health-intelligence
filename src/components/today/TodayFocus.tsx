"use client";

import { priorities } from "@/data/demo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppState } from "@/components/state/AppState";

export function TodayFocus() {
  const { openGuidance } = useAppState();
  return (
    <section aria-labelledby="focus-heading" className="mt-12">
      <SectionHeader id="focus-heading" en="TODAY" zh="今日重点" />
      <p className="mb-5 max-w-3xl text-sm leading-6 text-ink/70">最多三件。都按居家办公、经常外卖来写，不做理想化的餐食和训练安排。</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {priorities.map((priority, index) => (
          <article
            key={priority.id}
            id={priority.id === "next-meal" ? "priority-meal" : undefined}
            className="flex flex-col border border-line bg-white p-4"
          >
            <p lang="en" className="font-display text-[11px] font-semibold tracking-[0.16em] text-ink/45">
              FOCUS 0{index + 1}
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold leading-7">{priority.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-7">{priority.summary}</p>
            <button
              type="button"
              onClick={() => openGuidance(priority.id)}
              className="mt-4 self-start border border-ink px-3 py-2 text-sm hover:bg-ink hover:text-white"
            >
              查看具体做法
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
