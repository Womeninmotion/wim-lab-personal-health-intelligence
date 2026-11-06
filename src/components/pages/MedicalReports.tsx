"use client";

import { useEffect, useRef, useState } from "react";

type Report = { id: string; file_name: string; file_size: number; uploaded_at: string; report_date: string | null; notes: string | null };
export function MedicalReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportDate, setReportDate] = useState("");
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/private/medical-reports", { cache: "no-store" });
      if (!res.ok) throw new Error("加载失败");
      const result = (await res.json()) as { reports?: Report[] };
      setReports(result.reports || []);
    } catch { setStatus("暂时无法读取已上传报告。请检查登录状态和网络。"); }
  }
  useEffect(() => { void load(); }, []);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setStatus("请先选择 PDF、JPG 或 PNG 文件。"); return; }
    if (file.size > 4 * 1024 * 1024) { setStatus("单个文件不能超过 4 MB。"); return; }
    setBusy(true); setStatus("正在安全上传，请勿关闭页面…");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("reportDate", reportDate);
      body.set("notes", notes);
      const res = await fetch("/api/private/medical-reports", { method: "POST", body });
      if (!res.ok) { setStatus(res.status === 413 ? "文件超过大小限制。" : res.status === 401 ? "登录已失效，请重新登录。" : "上传失败。请确认已执行本补丁附带的数据库 SQL。" ); return; }
      setStatus("上传成功，已保存到私人健康档案。");
      if (fileRef.current) fileRef.current.value = "";
      setReportDate(""); setNotes("");
      await load();
    } catch { setStatus("上传时网络中断，未确认保存成功。可刷新列表检查后再试。"); }
    finally { setBusy(false); }
  }
  async function download(report: Report) {
    setStatus("正在读取私人报告…");
    try {
      const res = await fetch(`/api/private/medical-reports?id=${encodeURIComponent(report.id)}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = report.file_name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("报告已准备下载。");
    } catch { setStatus("下载失败。请检查登录状态后重试。"); }
  }
  return <section className="border border-line bg-white p-5 md:p-7">
    <p className="text-[11px] font-bold tracking-widest text-ink/55">MEDICAL RECORDS</p>
    <h2 className="mt-2 font-display text-xl font-bold">体检报告与健康档案</h2>
    <p className="mt-2 text-sm leading-7 text-ink/70">上传体检报告或化验单原件，仅你登录后可访问。此版本先安全存档；报告内容的自动提取、异常指标追踪和个性化解读尚未实现。</p>
    <form onSubmit={upload} className="mt-5 space-y-3">
      <label className="block text-sm font-semibold">报告文件（PDF / JPG / PNG，最大4MB）
        <input ref={fileRef} required type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="mt-2 block w-full text-sm" />
      </label>
      <label className="block text-sm font-semibold">报告日期（可选）
        <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="mt-2 block w-full border border-line p-3 font-normal" />
      </label>
      <label className="block text-sm font-semibold">备注（可选）
        <textarea maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} placeholder="例如：2026年度体检、血常规、复查…" className="mt-2 block w-full border border-line p-3 font-normal" rows={2} />
      </label>
      <button disabled={busy} type="submit" className="bg-orange px-5 py-3 text-sm font-bold disabled:opacity-50">{busy ? "上传中…" : "安全上传报告"}</button>
    </form>
    {status && <p role="status" className="mt-3 text-sm">{status}</p>}
    <h3 className="mt-8 border-t border-line pt-5 font-semibold">已上传报告 · {reports.length}</h3>
    {reports.length === 0 ? <p className="mt-2 text-sm text-ink/60">尚无报告。上传后会在这里列出。</p> :
      <ul className="mt-3 divide-y divide-line">{reports.map(r => <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span className="break-all">{r.file_name}<span className="ml-2 text-ink/60">{r.report_date || new Date(r.uploaded_at).toLocaleDateString("zh-CN")}</span></span><button onClick={() => void download(r)} type="button" className="underline decoration-orange underline-offset-4">下载</button></li>)}</ul>}
  </section>;
}
