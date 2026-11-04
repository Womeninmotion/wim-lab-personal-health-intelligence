"use client";

import { useState } from "react";
import { plan, remindOptions, unrealisticReasons } from "@/data/demo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppState } from "@/components/state/AppState";
import type { TaskStatus } from "@/lib/types";

const actions: { status: TaskStatus; label: string }[] = [
  { status: "done", label: "完成" },
  { status: "skipped", label: "跳过" },
  { status: "unrealistic", label: "不现实" },
  { status: "remind", label: "提醒我" },
];

const statusCopy: Record<TaskStatus, string> = {
  done: "已完成",
  skipped: "已跳过",
  unrealistic: "已标为不现实",
  remind: "已记下提醒",
};

export function TodayPlan() {
  const { tasks, setTask } = useAppState();
  const [pending, setPending] = useState<{ id: string; mode: "unrealistic" | "remind" } | null>(
    null,
  );
  const [choice, setChoice] = useState(unrealisticReasons[0]);
  const [customReason, setCustomReason] = useState("");

  const counts = plan.reduce(
    (total, task) => {
      const status = tasks[task.id]?.status;
      if (status) total[status] += 1;
      return total;
    },
    { done: 0, skipped: 0, unrealistic: 0, remind: 0 },
  );

  function choose(id: string, status: TaskStatus) {
    if (tasks[id]?.status === status) {
      setTask(id, null);
      setPending(null);
      return;
    }
    if (status === "unrealistic" || status === "remind") {
      setPending({ id, mode: status });
      setChoice(status === "remind" ? remindOptions[0] : unrealisticReasons[0]);
      setCustomReason("");
      return;
    }
    setPending(null);
    setTask(id, { status, updatedAt: new Date().toISOString() });
  }

  function submitReason(event: React.FormEvent) {
    event.preventDefault();
    if (!pending) return;
    const reason =
      pending.mode === "remind"
        ? choice
        : choice === "其他"
          ? customReason.trim()
          : choice;
    if (!reason) return;
    setTask(pending.id, {
      status: pending.mode,
      reason,
      updatedAt: new Date().toISOString(),
    });
    setPending(null);
  }

  return (
    <section aria-labelledby="plan-heading" className="mt-12">
      <SectionHeader id="plan-heading" en="TODAY'S PLAN" zh="今日行动" />
      <p className="mb-5 text-sm leading-6 text-ink/70">
        完成 {counts.done} · 跳过 {counts.skipped} · 不现实 {counts.unrealistic} · 提醒{" "}
        {counts.remind}。这些选择只留在这台浏览器，不会发通知。
      </p>
      <ol className="border-t border-line bg-white">
        {plan.map((task) => {
          const feedback = tasks[task.id];
          const asking = pending?.id === task.id;
          return (
            <li key={task.id} className="border-b border-line px-4 py-4 sm:px-5">
              <div className="grid gap-3 md:grid-cols-[72px_1fr]">
                <p className="font-display text-sm font-semibold tracking-wide">{task.time}</p>
                <div>
                  <h3 className="font-display text-base font-semibold">{task.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink/75">{task.detail}</p>
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`${task.title}的处理`}>
                    {actions.map((action) => {
                      const pressed = feedback?.status === action.status;
                      return (
                        <button
                          key={action.status}
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => choose(task.id, action.status)}
                          className={
                            pressed
                              ? "bg-ink px-3 py-1.5 text-sm text-white"
                              : "border border-line px-3 py-1.5 text-sm hover:border-ink"
                          }
                        >
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                  {feedback ? (
                    <p className="mt-3 text-sm leading-6">
                      {statusCopy[feedback.status]}
                      {feedback.reason ? `：${feedback.reason}` : ""}
                      {feedback.status === "remind"
                        ? "。演示不会真正提醒你。"
                        : ""}
                    </p>
                  ) : null}
                  {asking ? (
                    <form onSubmit={submitReason} className="mt-3 border border-line bg-paper p-3">
                      <fieldset>
                        <legend className="text-sm font-medium">
                          {pending.mode === "unrealistic" ? "哪里不现实？" : "希望在什么节点看到它？"}
                        </legend>
                        <div className="mt-2 grid gap-2">
                          {(pending.mode === "remind" ? remindOptions : unrealisticReasons).map(
                            (option) => (
                              <label key={option} className="flex items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name={`reason-${task.id}`}
                                  checked={choice === option}
                                  onChange={() => setChoice(option)}
                                />
                                {option}
                              </label>
                            ),
                          )}
                        </div>
                        {pending.mode === "unrealistic" && choice === "其他" ? (
                          <label className="mt-3 block text-sm">
                            写一句原因
                            <input
                              value={customReason}
                              onChange={(event) => setCustomReason(event.target.value)}
                              className="mt-1 w-full border border-line bg-white px-3 py-2 outline-none focus-visible:border-ink"
                            />
                          </label>
                        ) : null}
                      </fieldset>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="submit"
                          className="bg-orange px-3 py-1.5 text-sm font-semibold text-ink"
                        >
                          记下
                        </button>
                        <button
                          type="button"
                          onClick={() => setPending(null)}
                          className="border border-line bg-white px-3 py-1.5 text-sm"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
