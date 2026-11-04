"use client";

import { missingInputs } from "@/data/demo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppState } from "@/components/state/AppState";

export function NeedsInput() {
  const { openLog } = useAppState();
  return (
    <section aria-labelledby="input-heading" className="mt-12">
      <SectionHeader id="input-heading" en="NEEDS YOUR INPUT" zh="待补充信息" />
      <ul className="divide-y divide-line border-y border-line bg-white">
        {missingInputs.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() =>
                openLog({
                  category: item.category,
                  prompt: item.prompt,
                })
              }
              className="flex w-full flex-col items-start px-4 py-4 text-left hover:bg-paper sm:px-5"
            >
              <span className="font-display text-base font-semibold">{item.title}</span>
              <span className="mt-1 text-sm leading-6 text-ink/75">{item.detail}</span>
              <span className="mt-2 text-sm underline decoration-orange decoration-2 underline-offset-4">
                去记录
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
