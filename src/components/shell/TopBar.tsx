"use client";

import { usePathname } from "next/navigation";
import { useAppState } from "@/components/state/AppState";

const titles: Record<string, { en: string; zh: string }> = {
  "/": { en: "Today", zh: "今日" },
  "/food": { en: "Food", zh: "饮食" },
  "/log": { en: "Log", zh: "记录" },
  "/trends": { en: "Trends", zh: "趋势" },
  "/timeline": { en: "Timeline", zh: "时间线" },
  "/me": { en: "Me", zh: "我" },
};

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { openLog, openAsk } = useAppState();
  const title = titles[pathname] ?? titles["/"];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="border border-line px-3 py-2 text-sm lg:hidden"
          onClick={onMenu}
        >
          菜单
        </button>
        <div className="min-w-0">
          <p lang="en" className="font-display text-[11px] font-semibold tracking-[0.18em] text-ink/50">
            {title.en}
          </p>
          <p className="truncate font-display text-base font-semibold">{title.zh}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <p className="hidden text-right md:block">
          <span lang="en" className="block font-display text-[10px] font-semibold tracking-[0.16em] text-ink/45">
            STATUS
          </span>
          <span className="block text-xs leading-4 text-ink/75">
            身体测量已接入 · 其他数据待接入
          </span>
        </p>
        <button
          type="button"
          onClick={() => openAsk()}
          className="border border-ink px-3 py-2 text-sm font-medium hover:bg-ink hover:text-white"
        >
          ASK
        </button>
        <button
          type="button"
          onClick={() => openLog()}
          className="bg-orange px-3 py-2 text-sm font-semibold text-ink hover:bg-ink hover:text-white sm:px-4"
        >
          + LOG
        </button>
      </div>
    </header>
  );
}
