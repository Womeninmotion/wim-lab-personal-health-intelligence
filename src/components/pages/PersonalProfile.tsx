"use client";

import { useState } from "react";
import { defaultPersonalGoals, readPersonalGoals, savePersonalGoals, type PersonalGoals } from "@/lib/personalGoals";
import { useEffect } from "react";

const fields: { key: keyof PersonalGoals; label: string; type?: string; hint?: string }[] = [
  { key: "displayName", label: "称呼" },
  { key: "eventName", label: "赛事名称" },
  { key: "eventDate", label: "赛事日期", type: "date", hint: "确认日期后，首页自动计算倒计时。" },
  { key: "goalWeight", label: "目标体重（kg）", type: "number", hint: "初始值沿用此前讨论的 53 kg，请确认是否仍适用。" },
  { key: "dailySteps", label: "每日步数目标", type: "number" },
];

export function PersonalProfile() {
  const [form, setForm] = useState<PersonalGoals>(defaultPersonalGoals);
  const [saved, setSaved] = useState(false);
  useEffect(() => setForm(readPersonalGoals()), []);
  function update(key: keyof PersonalGoals, value: string) { setForm(prev => ({ ...prev, [key]: value })); setSaved(false); }
  return (
    <section className="max-w-2xl border border-line bg-white p-5 md:p-7">
      <p className="text-[11px] font-bold tracking-widest text-ink/55">MY PERSONAL CONTEXT</p>
      <h1 className="mt-2 font-display text-2xl font-bold">我的目标与基本资料</h1>
      <p className="mt-3 text-sm leading-7 text-ink/70">先确认个人目标。当前信息只保存在这台浏览器中，尚未连接受保护的个人数据库。请不要在这里录入体检报告或医疗隐私。</p>
      <form className="mt-6 space-y-4" onSubmit={event => { event.preventDefault(); savePersonalGoals(form); setSaved(true); }}>
        {fields.map(field => <label key={field.key} className="block"><span className="mb-1 block text-sm font-semibold">{field.label}</span><input type={field.type || "text"} step={field.type === "number" ? "any" : undefined} value={form[field.key]} onChange={e => update(field.key, e.target.value)} className="w-full rounded-none border border-line bg-white px-3 py-3 text-base focus:border-orange focus:outline-none" /><span className="mt-1 block text-xs text-ink/60">{field.hint}</span></label>)}
        <button type="submit" className="bg-orange px-5 py-3 text-sm font-bold">保存目标</button>
        {saved && <p className="text-sm font-medium" role="status">已保存到当前浏览器。返回 Today 可查看更新。</p>}
      </form>
      <button type="button" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); }} className="mt-8 border border-line px-4 py-2 text-sm">退出登录</button>
      <div className="mt-8 border-t border-line pt-5"><h2 className="font-display text-lg font-bold">我的健康记录</h2><p className="mt-2 text-sm leading-7 text-ink/70">体检报告上传、用药、月经周期、个人基线和设备连接尚未实现。下一阶段需先完成登录及私有文件存储，不能把报告放入公开 GitHub。</p></div>
    </section>
  );
}
