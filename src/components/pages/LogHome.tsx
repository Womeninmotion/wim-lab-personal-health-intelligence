"use client";

import { categoryLabels } from "@/lib/interpret";
import { formatStamp } from "@/lib/format";
import { useAppState } from "@/components/state/AppState";

export function LogHome() {
  const { logs, openLog, resetDemo } = useAppState();
  return (
    <article>
      <p className="inline-block bg-soft px-2 py-1 text-[11px] font-medium tracking-wide">
        占位 · 完整记录页以后再做
      </p>
      <p lang="en" className="mt-4 font-display text-[11px] font-semibold tracking-[0.18em] text-ink/50">
        LOG
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">记录</h1>
      <p className="mt-4 max-w-2xl text-base leading-8">
        现在请用右上角的 + LOG。已确认的内容只存在这台浏览器，整理规则不是 AI，图片也不会被识别。
      </p>
      <button
        type="button"
        onClick={() => openLog()}
        className="mt-5 bg-orange px-4 py-2 text-sm font-semibold text-ink hover:bg-ink hover:text-white"
      >
        打开记录
      </button>
      <section className="mt-8" aria-labelledby="saved-logs">
        <h2 id="saved-logs" className="font-display text-xl font-semibold">
          这台浏览器里的记录
        </h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-ink/70">还没有保存的记录。</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line bg-white">
            {logs.map((log) => (
              <li key={log.id} className="px-4 py-4">
                <p className="text-xs text-ink/55">
                  {formatStamp(log.updatedAt)} · {categoryLabels[log.category]}
                  {log.imageStatus === "attached-unprocessed" ? " · 图片未识别" : ""}
                </p>
                <p className="mt-1 text-sm leading-6">{log.rawText}</p>
                <button
                  type="button"
                  onClick={() =>
                    openLog({
                      editId: log.id,
                      draft: log.rawText,
                      category: log.category,
                      fields: log.fields,
                      imageName: log.imageName,
                    })
                  }
                  className="mt-2 text-sm underline decoration-orange decoration-2 underline-offset-4"
                >
                  编辑
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <button
        type="button"
        onClick={resetDemo}
        className="mt-6 text-sm underline decoration-ink/30 underline-offset-4"
      >
        清除这台浏览器里的演示记录和行动状态
      </button>
    </article>
  );
}
