"use client";

import { interpretation, provenance } from "@/data/demo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppState } from "@/components/state/AppState";

const columns = [
  { title: "已观察到的事实", items: interpretation.facts },
  { title: "可能的关联", items: interpretation.associations },
  { title: "尚不能确定的判断", items: interpretation.unknowns },
];

export function InterpretationSection() {
  const { openEvidence } = useAppState();
  return (
    <section aria-labelledby="meaning-heading" className="mt-12">
      <SectionHeader id="meaning-heading" en="WHAT IT MEANS TOGETHER" zh="综合解读" />
      <div className="border-l-4 border-orange bg-white px-5 py-6 sm:px-7">
        <p className="max-w-3xl font-display text-2xl font-semibold leading-snug tracking-tight">
          {interpretation.lead}
        </p>
        <p className="mt-4 max-w-3xl text-base leading-8">{interpretation.decision}</p>
        <button
          type="button"
          onClick={openEvidence}
          className="mt-5 bg-orange px-4 py-2 text-sm font-semibold text-ink hover:bg-ink hover:text-white"
        >
          为什么这样判断？
        </button>
      </div>
      <div className="mt-px grid gap-px bg-line md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="bg-white p-4 sm:p-5">
            <h3 className="font-display text-sm font-semibold">{column.title}</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-paper px-1 text-sm leading-6 text-ink/75">
        <p>
          置信：{interpretation.confidence}。{interpretation.confidenceNote}
        </p>
        <ul className="mt-2 space-y-1">
          {provenance.map((item) => (
            <li key={item.source}>
              {item.source}：{item.items}（{item.freshness}）
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
