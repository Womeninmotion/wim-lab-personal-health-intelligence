"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { useAppState } from "@/components/state/AppState";
import { categoryLabels, interpretEntry, suggestCategory } from "@/lib/interpret";
import { formatStamp } from "@/lib/format";
import type { InterpretedField, LogCategory, SavedLog } from "@/lib/types";

const categories = Object.keys(categoryLabels) as LogCategory[];

type Draft = {
  id: string | null;
  rawText: string;
  category: LogCategory;
  imageName: string | null;
  fields: InterpretedField[];
};

const emptyDraft: Draft = {
  id: null,
  rawText: "",
  category: "food",
  imageName: null,
  fields: [],
};

export function LogDrawer() {
  const { drawer, closeDrawer, logs, saveLog } = useAppState();
  const open = drawer.name === "log";
  const [step, setStep] = useState<"compose" | "review">("compose");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const nonce = open ? drawer.nonce : 0;
  const [seenNonce, setSeenNonce] = useState(0);

  if (open && nonce !== seenNonce) {
    setSeenNonce(nonce);
    const preset = drawer.preset;
    if (preset.editId && preset.fields) {
      setDraft({
        id: preset.editId,
        rawText: preset.draft ?? "",
        category: preset.category ?? "food",
        imageName: preset.imageName ?? null,
        fields: preset.fields,
      });
      setStep("review");
      setPrompt("正在修改一条已保存在这台浏览器里的记录。");
    } else {
      setDraft({
        ...emptyDraft,
        rawText: preset.draft ?? "",
        category: preset.category ?? "food",
      });
      setStep("compose");
      setPrompt(preset.prompt ?? null);
    }
    setSavedNote(null);
  }

  const suggestion =
    draft.rawText.trim().length > 0 ? suggestCategory(draft.rawText) : null;

  function review() {
    setDraft((current) => ({
      ...current,
      fields: interpretEntry(current.rawText, current.category),
    }));
    setStep("review");
    setSavedNote(null);
  }

  function updateField(id: string, value: string) {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === id ? { ...field, value } : field)),
    }));
  }

  function confirm() {
    const now = new Date().toISOString();
    const entry: SavedLog = {
      id: draft.id ?? crypto.randomUUID(),
      createdAt: draft.id
        ? logs.find((log) => log.id === draft.id)?.createdAt ?? now
        : now,
      updatedAt: now,
      rawText: draft.rawText.trim(),
      category: draft.category,
      fields: draft.fields,
      imageName: draft.imageName,
      imageStatus: draft.imageName ? "attached-unprocessed" : "none",
    };
    saveLog(entry);
    setSavedNote("已保存在这台浏览器。没有上传，也没有交给 AI。");
    setDraft(emptyDraft);
    setPrompt(null);
    setStep("compose");
  }

  return (
    <Drawer open={open} eyebrow="LOG" title="记一笔" onClose={closeDrawer}>
      <p className="text-sm leading-6 text-ink/75">
        用一句话写下饮食、症状、运动、心情、周期、社交或其他事情。整理结果来自关键词规则，不是 AI。请不要输入真实病历、姓名或证件信息。
      </p>

      {prompt ? (
        <p className="mt-4 border-l-2 border-orange bg-paper px-3 py-2 text-sm leading-6">{prompt}</p>
      ) : null}
      {savedNote ? (
        <p className="mt-4 bg-soft/40 px-3 py-2 text-sm leading-6" role="status">
          {savedNote}
        </p>
      ) : null}

      {step === "compose" ? (
        <div className="mt-5">
          <label htmlFor="log-text" className="text-sm font-medium">
            原文
          </label>
          <textarea
            id="log-text"
            value={draft.rawText}
            onChange={(event) => setDraft((current) => ({ ...current, rawText: event.target.value }))}
            rows={5}
            placeholder="例如：中午外卖点了牛肉饭和青菜，少酱。"
            className="mt-2 w-full border border-line bg-white px-3 py-2 text-sm leading-6 outline-none focus-visible:border-ink"
          />
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="记录类别">
            {categories.map((category) => {
              const selected = draft.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDraft((current) => ({ ...current, category }))}
                  className={
                    selected
                      ? "bg-ink px-3 py-1.5 text-sm text-white"
                      : "border border-line px-3 py-1.5 text-sm hover:border-ink"
                  }
                >
                  {categoryLabels[category]}
                </button>
              );
            })}
          </div>
          {suggestion && suggestion !== draft.category ? (
            <p className="mt-3 text-sm leading-6">
              文字更像「{categoryLabels[suggestion]}」。
              <button
                type="button"
                className="ml-2 underline decoration-orange decoration-2 underline-offset-4"
                onClick={() => setDraft((current) => ({ ...current, category: suggestion }))}
              >
                改成这个类别
              </button>
            </p>
          ) : null}

          <div className="mt-5 border border-dashed border-line px-3 py-3">
            <label htmlFor="log-image" className="text-sm font-medium">
              图片（尚未接入识别）
            </label>
            <p className="mt-1 text-xs leading-5 text-ink/65">
              可以选择图片，只保留文件名。不会上传，也不会假装识别出食物或报告。
            </p>
            <input
              id="log-image"
              type="file"
              accept="image/*"
              className="mt-3 block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setDraft((current) => ({
                  ...current,
                  imageName: file ? file.name : null,
                }));
              }}
            />
            {draft.imageName ? (
              <p className="mt-2 text-sm">
                已附加 {draft.imageName}。状态：尚未识别。
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!draft.rawText.trim()}
              onClick={review}
              className="bg-orange px-4 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              查看整理结果
            </button>
            <button
              type="button"
              className="border border-line px-4 py-2 text-sm"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  rawText: "中午外卖点了牛肉饭和一份青菜，酱少。没有喝奶茶。",
                  category: "food",
                }))
              }
            >
              填入示例
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <p className="bg-paper px-3 py-2 text-xs font-medium tracking-wide">规则整理 · 非 AI</p>
          <p className="mt-3 text-sm leading-6 text-ink/75">原文：{draft.rawText}</p>
          <div className="mt-4 space-y-3">
            {draft.fields.map((field) => (
              <label key={field.id} className="block text-sm">
                <span className="font-medium">{field.label}</span>
                <input
                  value={field.value}
                  onChange={(event) => updateField(field.id, event.target.value)}
                  className="mt-1 w-full border border-line px-3 py-2 outline-none focus-visible:border-ink"
                />
              </label>
            ))}
          </div>
          {draft.imageName ? (
            <p className="mt-3 text-sm leading-6">
              图片 {draft.imageName} 会以「已附加、尚未识别」保存。
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirm}
              className="bg-orange px-4 py-2 text-sm font-semibold text-ink hover:bg-ink hover:text-white"
            >
              确认保存
            </button>
            <button
              type="button"
              onClick={review}
              className="border border-line px-4 py-2 text-sm hover:border-ink"
            >
              按当前文字重新整理
            </button>
            <button
              type="button"
              onClick={() => setStep("compose")}
              className="border border-line px-4 py-2 text-sm hover:border-ink"
            >
              返回修改
            </button>
          </div>
        </div>
      )}

      <section className="mt-8 border-t border-line pt-5" aria-labelledby="recent-logs">
        <h3 id="recent-logs" className="font-display text-base font-semibold">
          最近记录
        </h3>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-ink/65">还没有保存在这台浏览器里的记录。</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {logs.slice(0, 6).map((log) => (
              <li key={log.id} className="py-3">
                <p className="text-xs text-ink/55">
                  {formatStamp(log.updatedAt)} · {categoryLabels[log.category]}
                  {log.imageStatus === "attached-unprocessed" ? " · 图片未识别" : ""}
                </p>
                <p className="mt-1 text-sm leading-6">{log.rawText}</p>
                <button
                  type="button"
                  className="mt-1 text-sm underline decoration-orange decoration-2 underline-offset-4"
                  onClick={() => {
                    setDraft({
                      id: log.id,
                      rawText: log.rawText,
                      category: log.category,
                      imageName: log.imageName,
                      fields: log.fields,
                    });
                    setStep("review");
                    setSavedNote(null);
                  }}
                >
                  编辑这条
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Drawer>
  );
}
