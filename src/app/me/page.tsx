import type { Metadata } from "next";
import { PersonalProfile } from "@/components/pages/PersonalProfile";
export const metadata: Metadata = { title: "Me" };
export default function Page() { return <PersonalProfile />; }
