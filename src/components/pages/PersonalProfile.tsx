"use client";

import { useEffect, useState } from "react";
import { defaultPersonalGoals, readPersonalGoals, savePersonalGoals, type PersonalGoals } from "@/lib/personalGoals";

// 2026-11-06 COROS review: dated coaching recommendation, NOT a live COROS integration.
// No individual workout records or sensitive health data are embedded in the public repository.
const initialRecommendation = {
  assessedAt: "2026-11-06",
  weekStart: "2026-11-09",
  weekEnd: "2026-11-15",
  runKm: "18",
  ascentM: "350",
  lowerRun: 16,
  upperRun: 20,
  lowerAscent: 250,
  upperAscent: 450,
};

const fields: { key: keyof PersonalGoals; label: string; type?: string; hint?: string }[] = [
  { key: "displayName", label: "称呼" },
  { key: "eventName", label: "赛事名称" },
  { key: "eventDate", label: "赛事日期", type: "date", hint: "用于赛事倒计时；不等于训练完成度。" },
  { key: "startDate", label: "减重起始日期", type: "date", hint: "本轮计划正式开始的日期。" },
  { key: "startWeight", label: "减重起始体重（kg）", type: "number", hint: "请按当日真实记录填写。" },
  { key: "goalWeight", label: "目标体重（kg）", type: "number" },
  { key: "startBodyFat", label: "起始体脂率（%）", type: "number", hint: "尽量使用同一台体脂秤、相近测量条件的数据。" },
  { key: "goalBodyFat", label: "目标体脂率（%）", type: "number", hint: "体脂变化用百分点表示；可暂不设置。" },
  { key: "dailySteps", label: "每日步数目标", type: "number" },
];

export function PersonalProfile() {
  const [form, setForm] = useState<PersonalGoals>(defaultPersonalGoals);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [proposalAccepted, setProposalAccepted] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    let active = true;
    setForm(readPersonalGoals());
    (async () => {
      try {
        const r = await fetch("/api/private/goals", { cache: "no-store" });
        if (!r.ok) { if (active) setStatus("云端目标读取失败，暂时显示此设备上一次的记录。"); return; }
        const j = await r.json() as { goals: Partial<PersonalGoals> | null };
        if (active && j.goals) {
          const g = { ...defaultPersonalGoals, ...j.goals };
          setForm(g); savePersonalGoals(g);
        } else if (active) setStatus("目前尚未有云端目标，检查后点击保存即可建立。");
      } catch { if (active) setStatus("无法连接目标数据库，请检查网络后重试。"); }
      finally { if (active) setDataReady(true); }
    })();
    return () => { active = false; };
  }, []);

  function update(key: keyof PersonalGoals, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    setStatus("");
  }

  function adoptProposal() {
    setForm(prev => ({ ...prev, weeklyRunKm: initialRecommendation.runKm, weeklyAscentM: initialRecommendation.ascentM }));
    setProposalAccepted(true);
    setStatus("建议已填入表单；请检查并点击下方“保存到云端”，才会正式生效。");
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setStatus("正在保存…");
    try {
      const res = await fetch("/api/private/goals", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) {
        setStatus(res.status === 400 ? "部分目标不符合校验条件：请检查日期、起始体重是否高于目标、体脂起点和目标是否合理。" : "保存失败，云端尚未更新。");
        return;
      }
      savePersonalGoals(form);
      setProposalAccepted(false);
      setStatus("已保存到 Supabase。刷新或重新登录后，仍会读取这组目标。");
    } catch { setStatus("网络错误，本次未保存到云端。"); }
    finally { setSaving(false); }
  }

  const currentWeekTargets = form.weeklyRunKm || form.weeklyAscentM;
  return (
    <section className="max-w-3xl border border-line bg-white p-5 md:p-7">
      <p className="text-[11px] font-bold tracking-widest text-ink/55">ME / MY GOALS</p>
      <h1 className="mt-2 font-display text-2xl font-bold">我的目标与训练建议</h1>
      <p className="mt-2 text-sm leading-7 text-ink/70">目标由系统提出依据，你可以确认或调整；保存后才同步到 Today。训练建议与实际完成值是两件事。</p>

      <div className="mt-6 border-y border-line py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold">50K 备赛 · 当前阶段建议</h2>
          <span className="text-xs text-ink/60">评估日期 2026/11/06 · 基于 COROS 已连接记录</span>
        </div>
        <p className="mt-2 text-sm leading-6">你最近的周跑量不连续，现阶段先重建规律，而不是直接追求50K赛前高峰跑量。</p>
        <p className="mt-1 text-xs leading-6 text-ink/65">适用范围：下一个完整训练周（11/09–11/15）。这是一次评估快照，<strong>不是网站实时读取 COROS 后自动生成的建议</strong>。</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-ink/60">建议周跑量</div>
            <p className="mt-1 font-display text-2xl font-semibold">18 <span className="text-sm font-normal">km</span></p>
            <p className="mt-1 text-xs text-ink/60">可调整范围 16–20 km</p>
          </div>
          <div>
            <div className="text-xs text-ink/60">建议周累计爬升</div>
            <p className="mt-1 font-display text-2xl font-semibold">350 <span className="text-sm font-normal">m+</span></p>
            <p className="mt-1 text-xs text-ink/60">可调整范围 250–450 m+</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-6 text-ink/65">口径：跑量只计跑步和越野跑；爬升可计入徒步专项训练，但徒步里程不重复加到跑量。若仍咳嗽或运动中出现胸痛、明显气短等不适，不应执行该目标，应先降低训练并寻求医疗评估。</p>
        {currentWeekTargets && <p className="mt-2 text-xs text-ink/70">当前保存的周目标：{form.weeklyRunKm || "—"} km / {form.weeklyAscentM || "—"} m+</p>}
        <button type="button" onClick={adoptProposal} disabled={!dataReady} className="mt-3 border border-orange px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50">采用建议值 18 km / 350 m+ </button>
        {proposalAccepted && <p className="mt-2 text-xs text-ink/70">已填入下方字段；还需点击“保存目标到云端”。</p>}
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSave}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block"><span className="mb-1 block text-sm font-semibold">每周跑量目标（km）</span><input type="number" min="0" step="0.5" value={form.weeklyRunKm} onChange={e => update("weeklyRunKm", e.target.value)} className="w-full border border-line bg-white px-3 py-2.5" /></label>
          <label className="block"><span className="mb-1 block text-sm font-semibold">每周爬升目标（m+）</span><input type="number" min="0" step="10" value={form.weeklyAscentM} onChange={e => update("weeklyAscentM", e.target.value)} className="w-full border border-line bg-white px-3 py-2.5" /></label>
        </div>
        <p className="text-xs text-ink/60">以上目标需要按每周真实完成情况、恢复及赛事要求重新评估；当前版本还不会自动调整它们。</p>
        <div className="border-t border-line pt-4"><h2 className="text-base font-bold">长期目标与个人基线</h2></div>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(field => <label key={field.key} className="block"><span className="mb-1 block text-sm font-semibold">{field.label}</span><input type={field.type || "text"} step={field.type === "number" ? "any" : undefined} value={form[field.key]} onChange={e => update(field.key, e.target.value)} className="w-full border border-line bg-white px-3 py-2.5 focus:border-orange focus:outline-none" /><span className="mt-1 block text-xs text-ink/60">{field.hint}</span></label>)}
        </div>
        <button type="submit" disabled={saving || !dataReady} className="bg-orange px-5 py-3 text-sm font-bold disabled:opacity-60">{saving ? "保存中…" : "保存目标到云端"}</button>
        {status && <p role="status" className="text-sm font-medium">{status}</p>}
      </form>
      <button type="button" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); }} className="mt-7 border border-line px-4 py-2 text-sm">退出登录</button>
    </section>
  );
}
