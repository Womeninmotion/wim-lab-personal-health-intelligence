import Link from "next/link";
import { goals } from "@/data/demo";
import { Meter } from "@/components/ui/Meter";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function GoalsSection() {
  return (
    <section aria-labelledby="goals-heading" className="mt-10">
      <SectionHeader id="goals-heading" en="YOUR DIRECTION" zh="我的目标进度" />
      <p className="mb-5 max-w-3xl text-sm leading-6 text-ink/70">
        进度条只表示这套示例离各自目标还有多远，不是健康评分。
      </p>
      <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
        {goals.map((goal) => (
          <article key={goal.id} className="flex flex-col bg-white p-4">
            <h3 className="font-display text-base font-semibold">{goal.title}</h3>
            <p className="mt-3 text-sm leading-6">
              <span className="text-ink/50">当前 </span>
              {goal.now}
            </p>
            <p className="mt-1 text-sm leading-6">
              <span className="text-ink/50">目标 </span>
              {goal.target}
            </p>
            <div className="mt-4">
              <Meter value={goal.progress} label={goal.meterLabel} />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/80">
              <span className="text-ink/50">偏差 </span>
              {goal.deviation}
            </p>
            <Link
              href={`/trends?focus=${goal.id}`}
              className="mt-4 text-sm underline decoration-orange decoration-2 underline-offset-4"
            >
              查看这项趋势
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
