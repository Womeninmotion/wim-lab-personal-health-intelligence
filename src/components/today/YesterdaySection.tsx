"use client";

import { useState } from "react";
import { yesterday } from "@/data/demo";
import { SectionHeader } from "@/components/ui/SectionHeader";

const labels: Record<string,string> = { activity: "运动与活动", food: "饮食", sleep: "睡眠", body: "身体", life: "生活" };

export function YesterdaySection() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <section aria-labelledby="yesterday-heading" className="mt-10">
      <SectionHeader id="yesterday-heading" en="YESTERDAY" zh="昨日回顾" />
      <p className="mb-4 text-sm text-ink/60">以下为演示案例。接入你的真实数据后，才会生成属于你的昨日回顾。</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {yesterday.map(item => (
          <article key={item.id} className="border border-line bg-white p-4">
            <h3 className="font-display text-base font-bold">{labels[item.id] || item.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/75">{item.meaning}</p>
            <button type="button" onClick={() => setExpanded(expanded === item.id ? null : item.id)} aria-expanded={expanded === item.id} className="mt-3 text-sm font-semibold underline decoration-orange decoration-2 underline-offset-4">{expanded === item.id ? "收起详情" : "查看示例详情"}</button>
            {expanded === item.id && <div className="mt-4 space-y-2 border-t border-line pt-3 text-sm leading-6 text-ink/75"><p>{item.data}</p><p>{item.relation}</p></div>}
          </article>
        ))}
      </div>
    </section>
  );
}
