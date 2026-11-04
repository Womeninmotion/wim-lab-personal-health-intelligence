"use client";

import { useState } from "react";
import { ahead } from "@/data/demo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { addDays, shortDate } from "@/lib/format";
import { useClientClock } from "@/lib/useClientDate";

export function LookingAhead() {
  const [open, setOpen] = useState(false);
  const clock = useClientClock();
  const today = clock ? new Date(clock.iso) : null;

  return (
    <section aria-labelledby="ahead-heading" className="mt-12">
      <SectionHeader id="ahead-heading" en="LOOKING AHEAD" zh="提前准备" />
      <article className="border border-line bg-white p-5">
        <p className="text-xs font-medium tracking-wide text-ink/55">虚构演示 · 未读取日历</p>
        <h3 className="mt-2 font-display text-2xl font-semibold">{ahead.title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7">{ahead.disclaimer}</p>
        <p className="mt-3 max-w-3xl text-sm leading-7">{ahead.summary}</p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium">活动</dt>
            <dd className="mt-1 text-sm leading-6 text-ink/80">
              展馆步行和站立可能明显高于 8,000 步。那几天不必再为步数加练。
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium">饮食</dt>
            <dd className="mt-1 text-sm leading-6 text-ink/80">
              茶歇和应酬会把正餐打散。提前想好两顿能吃到蛋白质的后备，而不是临时只吃点心。
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium">日程</dt>
            <dd className="mt-1 text-sm leading-6 text-ink/80">
              示意上是早出晚归。这里没有你的会议、航班或展位时间。
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium">恢复</dt>
            <dd className="mt-1 text-sm leading-6 text-ink/80">
              睡眠可能变短。展期不加训，返程当天不补课。
            </dd>
          </div>
        </dl>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="mt-5 bg-orange px-4 py-2 text-sm font-semibold text-ink hover:bg-ink hover:text-white"
        >
          {open ? "收起准备方案" : "展开准备方案"}
        </button>
        {open ? (
          <ol className="mt-5 divide-y divide-line border-t border-line">
            {ahead.days.map((day) => (
              <li key={day.offset} className="grid gap-2 py-4 md:grid-cols-[140px_1fr]">
                <h4 className="font-display text-sm font-semibold">
                  {day.title}
                  <span className="mt-1 block font-body text-xs font-normal text-ink/55">
                    {today ? shortDate(addDays(today, day.offset)) : `从今天起第 ${day.offset} 天`}
                  </span>
                </h4>
                <div className="space-y-1 text-sm leading-6">
                  <p>活动：{day.activity}</p>
                  <p>饮食：{day.food}</p>
                  <p>日程：{day.schedule}</p>
                  <p>恢复：{day.recovery}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </article>
    </section>
  );
}
