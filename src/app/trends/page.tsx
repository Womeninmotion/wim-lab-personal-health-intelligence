import type { Metadata } from "next";
import { Placeholder } from "@/components/pages/Placeholder";
import { goalById } from "@/data/demo";

export const metadata: Metadata = { title: "趋势" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string | string[] }>;
}) {
  const params = await searchParams;
  const focusValue = Array.isArray(params.focus) ? params.focus[0] : params.focus;
  const goal = goalById(focusValue);

  return (
    <Placeholder
      en="TRENDS"
      zh="趋势"
      lede="趋势页以后说明一段时间内什么在变。现在没有真实历史，所以不画一条看起来像你的曲线。"
      note={
        goal
          ? `你从「${goal.title}」进来。这项的示例偏差是：${goal.deviation}`
          : undefined
      }
      points={[
        "日常步数和训练课会分开看，同一次力量课不会再被算成另一段运动。",
        "体脂、睡眠和心率只和这个人自己的基线比，不和人群常模比。",
        "数据接入之前，这里保持为说明，而不是假图表。",
      ]}
    />
  );
}
