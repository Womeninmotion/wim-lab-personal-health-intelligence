'use client';
import { useCallback, useEffect, useState } from 'react';
export type Measurement = { metric_name: 'weight_kg' | 'body_fat_pct' | 'lean_mass_kg' | 'bmi'; value: number; unit: string; measured_at: string; source_app: string; source_device_label: string | null };
export function usePrivateMeasurements() {
  const [measurements,setMeasurements] = useState<Measurement[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [updatedAt,setUpdatedAt] = useState<string|null>(null);
  const [lastIngestAt,setLastIngestAt] = useState<string|null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/private/measurements', { credentials:'same-origin', cache:'no-store' });
      if (!res.ok) throw new Error(res.status === 401 ? '登录已过期，请刷新页面重新登录。' : '数据库暂不可读取。');
      const data = await res.json();
      setMeasurements(Array.isArray(data.measurements) ? data.measurements : []);
      setUpdatedAt(new Date().toISOString());
      setLastIngestAt(typeof data.lastIngestAt === 'string' ? data.lastIngestAt : null);
    } catch(e) { setError(e instanceof Error ? e.message : '网络异常'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void reload();
    const onFocus=()=>{ if(document.visibilityState==='visible') void reload(); };
    document.addEventListener('visibilitychange',onFocus);
    return ()=>document.removeEventListener('visibilitychange',onFocus);
  }, [reload]);
  return { measurements, loading, error, reload, updatedAt, lastIngestAt };
}
export function latestOf(rows: Measurement[], metric: Measurement['metric_name']): Measurement | undefined { return rows.find(r => r.metric_name === metric); }
export function timeInShenzhen(value: string) { return new Intl.DateTimeFormat('zh-CN',{ timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false }).format(new Date(value)); }
