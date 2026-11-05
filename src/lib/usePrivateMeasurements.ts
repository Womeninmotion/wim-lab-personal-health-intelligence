'use client';
import { useEffect, useState } from 'react';
export type Measurement = { metric_name: 'weight_kg' | 'body_fat_pct' | 'lean_mass_kg' | 'bmi'; value: number; unit: string; measured_at: string; source_app: string; source_device_label: string | null };
export function usePrivateMeasurements() {
  const [measurements,setMeasurements] = useState<Measurement[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/private/measurements', { signal: controller.signal, credentials: 'same-origin', cache:'no-store' })
      .then(async res => { if(!res.ok) throw new Error(res.status === 401 ? '登录已过期，请刷新页面重新登录。' : '数据暂时无法读取，请检查同步状态。'); return res.json(); })
      .then(data => setMeasurements(Array.isArray(data.measurements) ? data.measurements : []))
      .catch(err => { if(err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if(!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return { measurements, loading, error };
}
export function latestOf(rows: Measurement[], metric: Measurement['metric_name']): Measurement | undefined { return rows.find(r => r.metric_name === metric); }
export function timeInShenzhen(value: string) { return new Intl.DateTimeFormat('zh-CN',{ timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false }).format(new Date(value)); }
