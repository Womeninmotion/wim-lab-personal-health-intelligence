import type { Metadata } from "next";
import { LogHome } from "@/components/pages/LogHome";

export const metadata: Metadata = { title: "记录" };

export default function Page() {
  return <LogHome />;
}
