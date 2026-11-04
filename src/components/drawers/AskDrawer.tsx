"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { useAppState } from "@/components/state/AppState";
import { scriptsForPath } from "@/data/ask";
import { demoAnswer } from "@/lib/interpret";

export function AskDrawer() {
  const pathname = usePathname();
  const { drawer, closeDrawer } = useAppState();
  const open = drawer.name === "ask";
  const scripts = scriptsForPath(pathname);
  const [custom, setCustom] = useState("");
  const [reply, setReply] = useState<string[] | null>(null);
  const [replyTitle, setReplyTitle] = useState<string | null>(null);

  function showScript(question: string, answer: string[]) {
    setReplyTitle(question);
    setReply(answer);
  }

  function askCustom(event: React.FormEvent) {
    event.preventDefault();
    const question = custom.trim();
    if (!question) return;
    const matched = scripts.find((script) => script.question === question);
    if (matched) {
      showScript(matched.question, matched.answer);
      return;
    }
    setReplyTitle(question);
    setReply(demoAnswer(question));
  }

  return (
    <Drawer open={open} eyebrow="ASK" title="问问看" onClose={closeDrawer}>
      <p className="bg-paper px-3 py-2 text-sm leading-6">
        演示回复 · 非实时 AI。下面的答案是写好的示例，用来说明这个入口以后怎样回答。它不会读取你的数据。
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {scripts.map((script) => (
          <button
            key={script.id}
            type="button"
            onClick={() => showScript(script.question, script.answer)}
            className="border border-line px-3 py-2 text-left text-sm leading-6 hover:border-ink"
          >
            {script.question}
          </button>
        ))}
      </div>
      <form onSubmit={askCustom} className="mt-5">
        <label htmlFor="ask-custom" className="text-sm font-medium">
          自己写一个问题
        </label>
        <textarea
          id="ask-custom"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          rows={3}
          className="mt-2 w-full border border-line px-3 py-2 text-sm leading-6 outline-none focus-visible:border-ink"
        />
        <button
          type="submit"
          className="mt-3 bg-orange px-4 py-2 text-sm font-semibold text-ink hover:bg-ink hover:text-white"
        >
          查看演示回复
        </button>
      </form>
      {reply && replyTitle ? (
        <article className="mt-6 border-t border-line pt-5" aria-live="polite">
          <p className="text-xs font-medium tracking-wide text-ink/55">演示回复 · 非实时 AI</p>
          <h3 className="mt-2 font-display text-lg font-semibold leading-7">{replyTitle}</h3>
          <div className="mt-3 space-y-3 text-sm leading-7">
            {reply.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      ) : null}
    </Drawer>
  );
}
