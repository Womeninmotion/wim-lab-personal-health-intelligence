"use client";

import { Drawer } from "@/components/ui/Drawer";
import { useAppState } from "@/components/state/AppState";
import { evidence, interpretation, provenance } from "@/data/demo";

export function EvidenceDrawer() {
  const { drawer, closeDrawer } = useAppState();
  return (
    <Drawer
      open={drawer.name === "evidence"}
      eyebrow="EVIDENCE"
      title="为什么这样判断？"
      onClose={closeDrawer}
    >
      <p className="text-sm leading-6">
        置信：{interpretation.confidence}。{interpretation.confidenceNote}
      </p>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {evidence.map((item) => (
          <li key={item.id} className="py-4">
            <p className="text-xs font-medium text-ink/55">{item.kind}</p>
            <p className="mt-1 text-sm leading-6">{item.claim}</p>
            <p className="mt-2 text-xs leading-5 text-ink/70">来源：{item.source}</p>
            <p className="text-xs leading-5 text-ink/70">{item.note}</p>
          </li>
        ))}
      </ul>
      <h3 className="mt-6 font-display text-base font-semibold">数据从哪来</h3>
      <ul className="mt-3 space-y-3">
        {provenance.map((item) => (
          <li key={item.source} className="text-sm leading-6">
            <span className="font-medium">{item.source}</span>
            <span className="text-ink/75"> · {item.items}</span>
            <span className="block text-xs text-ink/55">{item.freshness}</span>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}
