'use client';
import { useState, type FormEvent } from 'react';
export function LoginGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ email, password }) });
      if (!res.ok) { const msg = await res.json(); throw new Error(msg.error || '登录失败'); }
      window.location.assign('/');
    } catch (e) { setError(e instanceof Error ? e.message : '登录失败'); setBusy(false); }
  }
  return <main className="min-h-screen bg-paper flex items-center justify-center p-5 text-ink">
    <section className="w-full max-w-md border border-line bg-white p-7 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-widest text-ink/60">WENDYINMOTION / PRIVATE LAB</p>
      <h1 className="mt-4 text-3xl font-bold">欢迎回来，Wendy。</h1>
      <p className="mt-3 text-sm leading-7 text-ink/70">这是你的个人健康工作台。请使用 WIM Lab 的登录邮箱和密码；它与 Supabase 管理后台账号是两套不同的身份。</p>
      <form onSubmit={signIn} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">邮箱<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full border border-line p-3 font-normal" /></label>
        <label className="block text-sm font-semibold">密码<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full border border-line p-3 font-normal" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full bg-orange p-3 font-semibold disabled:opacity-60">{busy ? '正在验证…' : '安全登录'}</button>
      </form>
      <p className="mt-6 text-xs leading-6 text-ink/60">此版本只允许已绑定的单一测试账号访问。真实健康数据不会公开展示。</p>
    </section>
  </main>;
}
