import type { Metadata } from 'next';
import { RealTrends } from '@/components/pages/RealTrends';
export const metadata: Metadata = { title: '身体测量趋势' };
export default function Page() { return <RealTrends />; }
