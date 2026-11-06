import type {Metadata} from 'next';
import {PersonalProfile} from '@/components/pages/PersonalProfile';
import {MedicalReports} from '@/components/pages/MedicalReports';
import {CorosConnection} from '@/components/pages/CorosConnection';
export const metadata:Metadata={title:'我的健康档案 · WIM Lab'};
export default function Page(){return <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-12"><PersonalProfile/><CorosConnection/><MedicalReports/></div>}
