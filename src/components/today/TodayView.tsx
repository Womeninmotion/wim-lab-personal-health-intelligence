import { GoalsSection } from '@/components/today/GoalsSection';
import { MorningGreeting } from '@/components/today/MorningGreeting';
export function TodayView() {
  return <>
    <MorningGreeting />
    <GoalsSection />
    <section className="border border-line bg-white p-5 md:p-6">
      <p className="text-xs font-semibold tracking-widest text-ink/60">DATA CONNECTION STATUS</p>
      <h2 className="mt-2 text-xl font-bold">身体测量已接入，其他数据正在建设中</h2>
      <p className="mt-3 text-sm leading-7 text-ink/70">当前显示真实的小米 S800 数据。运动、睡眠、饮食与日程还没有形成完整的数据闭环，因此暂不根据缺失数据生成“昨日解读”或训练处方。</p>
      <p className="mt-3 text-xs text-ink/60">来源：Mi Fitness → Apple Health → Health Auto Export → WIM Lab。只有在数据到达并完成解析后才会更新。</p>
    </section>
  </>;
}
