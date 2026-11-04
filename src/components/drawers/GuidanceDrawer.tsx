"use client";

import { Drawer } from "@/components/ui/Drawer";
import { useAppState } from "@/components/state/AppState";
import { priorityById } from "@/data/demo";

export function GuidanceDrawer() {
  const { drawer, closeDrawer } = useAppState();
  const priority = drawer.name === "guidance" ? priorityById(drawer.priorityId) : undefined;
  return (
    <Drawer
      open={drawer.name === "guidance" && Boolean(priority)}
      eyebrow="FOCUS"
      title={priority?.title ?? "今日重点"}
      onClose={closeDrawer}
    >
      {priority ? (
        <div className="space-y-5 text-sm leading-7">
          <p>{priority.summary}</p>
          <section>
            <h3 className="font-display text-base font-semibold">为什么是这件事</h3>
            <p className="mt-2">{priority.why}</p>
          </section>
          <section>
            <h3 className="font-display text-base font-semibold">可以怎么做</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              {priority.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          <section>
            <h3 className="font-display text-base font-semibold">今天先不要</h3>
            <p className="mt-2">{priority.avoid}</p>
          </section>
          <p className="text-xs leading-5 text-ink/60">
            以上根据示例剧本写成，不是医嘱，也不是针对你的个人建议。
          </p>
        </div>
      ) : null}
    </Drawer>
  );
}
