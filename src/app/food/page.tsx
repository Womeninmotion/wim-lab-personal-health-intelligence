import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/pages/Placeholder";

export const metadata: Metadata = { title: "Food" };

export default function Page() {
  return (
    <>
      <Placeholder
        en="FOOD"
        zh="饮食"
        lede="饮食页以后专门处理「下一餐怎么点」，尤其是外卖和在外吃。现在这层还没展开。"
        points={[
          "会按居家工作、配送和时间来建议，而不是给一份理想菜单。",
          "午餐缺失时，先补记录，再谈全天吃了多少。",
          "今日里已经有一条可打开的下一餐重点。",
        ]}
      />
      <Link
        href="/#priority-meal"
        className="mt-4 inline-block text-sm underline decoration-orange decoration-2 underline-offset-4"
      >
        查看今日的下一餐
      </Link>
    </>
  );
}
