"use client";

import { useEffect, useState } from "react";
import { defaultPersonalGoals, readPersonalGoals, savePersonalGoals, type PersonalGoals } from "@/lib/personalGoals";

const fields: { key: keyof PersonalGoals; label: string; type?: string; hint?: string }[] = [
  { key: "displayName", label: "称呼" },
  { key: "eventName", label: "赛事名称" },
  { key: "eventDate", label: "赛事日期", type: "date", hint: "保存后，首页自动计算赛事倒计时。" },
  { key: "startDate", label: "减重起始日期", type: "date", hint: "选择你正式开始追踪这一轮减重计划的日期。" },
  { key: "startWeight", label: "减重起始体重（kg）", type: "number", hint: "请填该日期的实际称重值。未确认前不使用历史最高体重代替。" },
  { key: "goalWeight", label: "目标体重（kg）", type: "number", hint: "保存当前想达到的体重，不自动改回旧目标。" },
  { key: "startBodyFat", label: "起始体脂率（%）", type: "number", hint: "选择与起始体重相近日期、同设备的测量值。可留空。" },
  { key: "goalBodyFat", label: "目标体脂率（%）", type: "number", hint: "与体重目标分开管理，暂未确认时可留空。" },
  { key: "weeklyRunKm", label: "当前训练阶段每周跑量目标（km）", type: "number", hint: "按训练计划填写，不按50K赛事距离推算。" },
  { key: "weeklyAscentM", label: "当前训练阶段每周累计爬升目标（m）", type: "number", hint: "按训练计划填写，训练阶段变化时更新。" },
  { key: "dailySteps", label: "每日步数目标", type: "number" },
];

export function PersonalProfile() {
  const [form, setForm] = useState<PersonalGoals>(defaultPersonalGoals);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    setForm(readPersonalGoals());
    (async () => {
      try {
        const r = await fetch('/api/private/goals', { cache: 'no-store' });
        if (!r.ok) { if (active) setStatus('无法读取云端目标，请检查网络；本地设置暂时保留。'); return; }
        const j = await r.json() as { goals: Partial<PersonalGoals> | null };
        if (active && j.goals) { const g = { ...defaultPersonalGoals, ...j.goals }; setForm(g); savePersonalGoals(g); }
        else if (active) setStatus('尚未保存云端目标。请检查当前设置并点击保存。');
      } catch { if (active) setStatus('网络暂不可用，未读取云端目标。'); }
    })();
    return () => { active = false; };
  }, []);
  function update(key: keyof PersonalGoals, value: string) { setForm(prev => ({ ...prev, [key]: value })); setStatus(''); }
  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setStatus('正在保存…');
    try {
      const res = await fetch('/api/private/goals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { setStatus(res.status === 400 ? '请检查起始日期和体重：两者需要同时填写，起始体重高于目标体重；体脂目标应低于起始体脂。' : '保存失败，云端未更新。请检查登录和网络后重试。'); return; }
      savePersonalGoals(form);
      setStatus('已保存到个人数据库。换设备登录也会恢复相同目标。');
    } catch { setStatus('网络错误，云端未保存，请重试。'); }
    finally { setSaving(false); }
  }
  return (
    <section className="max-w-2xl border border-line bg-white p-5 md:p-7">
      <p className="text-[11px] font-bold tracking-widest text-ink/55">MY PERSONAL CONTEXT</p>
      <h1 className="mt-2 font-display text-2xl font-bold">我的目标与基本资料</h1>
      <p className="mt-3 text-sm leading-7 text-ink/70">你的目标将保存在私人数据库，并在已登录设备间保持一致。起始体重与日期由你确认，系统不会擅自推断。</p>
      <form className="mt-6 space-y-4" onSubmit={onSave}>
        {fields.map(field => <label key={field.key} className="block"><span className="mb-1 block text-sm font-semibold">{field.label}</span><input type={field.type || "text"} step={field.type === "number" ? "any" : undefined} value={form[field.key]} onChange={e => update(field.key, e.target.value)} className="w-full rounded-none border border-line bg-white px-3 py-3 text-base focus:border-orange focus:outline-none" /><span className="mt-1 block text-xs text-ink/60">{field.hint}</span></label>)}
        <button type="submit" disabled={saving} className="bg-orange px-5 py-3 text-sm font-bold disabled:opacity-60">{saving ? '保存中…' : '保存目标到云端'}</button>
        {status && <p role="status" className="text-sm font-medium">{status}</p>}
      </form>
      <button type="button" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); }} className="mt-8 border border-line px-4 py-2 text-sm">退出登录</button>
      <div className="mt-8 border-t border-line pt-5"><h2 className="font-display text-lg font-bold">我的健康记录</h2><p className="mt-2 text-sm leading-7 text-ink/70">当前已连接小米 S800 身体测量。COROS 运动、RingConn 睡眠、日历和体检报告尚未进入本站数据库；目前不能基于它们生成个性化结论。</p></div>
    </section>
  );
}
