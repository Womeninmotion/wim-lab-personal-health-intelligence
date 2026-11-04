"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/shell/Wordmark";
import { cx } from "@/lib/cx";

const items = [
  { href: "/", en: "Today", zh: "今日" },
  { href: "/food", en: "Food", zh: "饮食" },
  { href: "/log", en: "Log", zh: "记录" },
  { href: "/trends", en: "Trends", zh: "趋势" },
  { href: "/timeline", en: "Timeline", zh: "时间线" },
  { href: "/me", en: "Me", zh: "我" },
];

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          aria-label="关闭导航"
          onClick={onNavigate}
        />
      ) : null}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-line bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-line px-5 py-5">
          <Wordmark />
          <p className="mt-4 font-display text-sm font-semibold leading-5">
            Personal Health Intelligence
          </p>
          <p className="mt-1 text-xs leading-5 text-ink/65">个人健康情报 · 原型</p>
        </div>
        <nav aria-label="主导航" className="flex flex-1 flex-col py-3">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "mx-3 flex items-baseline justify-between border-l-2 px-3 py-2.5",
                  active
                    ? "border-orange bg-paper"
                    : "border-transparent hover:bg-paper",
                )}
              >
                <span lang="en" className="font-display text-sm font-semibold tracking-wide">
                  {item.en}
                </span>
                <span className="text-sm text-ink/70">{item.zh}</span>
              </Link>
            );
          })}
        </nav>
        <p className="border-t border-line px-5 py-4 text-[11px] leading-5 text-ink/55">
          DEMO · 示例数据。未连接设备、日历或 AI。
        </p>
      </aside>
    </>
  );
}
