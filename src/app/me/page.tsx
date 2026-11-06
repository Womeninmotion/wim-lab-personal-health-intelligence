import type { Metadata } from "next";
import { Placeholder } from "@/components/pages/Placeholder";

export const metadata: Metadata = { title: "Me" };

export default function Page() {
  return (
    <Placeholder
      en="ME"
      zh="我"
      lede="「我」以后放目标、个人基线、生活限制和体检背景。这一版还没有档案，也没有登录。"
      points={[
        "示例基线只存在演示文案里，例如静息心率约 62 次/分。",
        "不会在这里收集姓名、病历或账号。",
        "目标的当前进度先放在今日页。",
      ]}
    />
  );
}
