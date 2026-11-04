import { yesterday } from "@/data/demo";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function YesterdaySection() {
  return (
    <section aria-labelledby="yesterday-heading" className="mt-12">
      <SectionHeader id="yesterday-heading" en="YESTERDAY" zh="昨日回顾" />
      <p className="mb-5 max-w-3xl text-sm leading-6 text-ink/70">
        这是固定剧本里的「昨天」，不会随你的真实日历改变。力量课只出现一次；课前后的走动算在全日步数里。
      </p>
      <div className="divide-y divide-line border-y border-line bg-white">
        {yesterday.map((item) => (
          <article key={item.id} className="grid gap-4 px-4 py-5 md:grid-cols-[160px_1fr] md:px-5">
            <h3 className="font-display text-base font-semibold">{item.title}</h3>
            <div className="space-y-3 text-sm leading-7">
              <p>
                <span className="font-medium">关键数据 </span>
                {item.data}
              </p>
              <p>
                <span className="font-medium">这意味着 </span>
                {item.meaning}
              </p>
              <p>
                <span className="font-medium">和什么有关 </span>
                {item.relation}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
