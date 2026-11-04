import type { Metadata } from "next";
import { Placeholder } from "@/components/pages/Placeholder";

export const metadata: Metadata = { title: "时间线" };

export default function Page() {
  return (
    <Placeholder
      en="TIMELINE"
      zh="时间线"
      lede="时间线以后把训练、饮食、睡眠、出行和主观记录按日子串起来。现在只有今日里的一个虚构展览，用来演示「提前看」。"
      points={[
        "展览行程是写死的演示，不是从日历读到的。",
        "同一节训练不会在活动和生活事件里各算一遍。",
        "真实日程接入前，不会声称知道你接下来要去哪里。",
      ]}
    />
  );
}
