"use client";

import { interpretation } from "@/data/demo";
import { useAppState } from "@/components/state/AppState";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function InterpretationSection() {
  const { openEvidence } = useAppState();
  return (
    <section aria-labelledby="meaning-heading" className="mt-10">
      <SectionHeader id="meaning-heading" en="THE BIG PICTURE" zh="放在一起看" />
      <article className="border border-line bg-white p-5 md:p-7">
        <p className="mb-3 text-xs font-semibold tracking-wide text-ink/55">案例演示 · 非 Wendy 的健康判断</p>
        <h3 className="max-w-3xl font-display text-xl font-bold leading-snug md:text-2xl">{interpretation.lead}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/75">{interpretation.decision}</p>
        <button type="button" onClick={openEvidence} className="mt-5 border-b-2 border-orange pb-1 text-sm font-semibold">查看依据与不确定性 →</button>
      </article>
    </section>
  );
}
