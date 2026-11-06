import type { Metadata } from "next";
import { LogHome } from "@/components/pages/LogHome";

export const metadata: Metadata = { title: "Log" };

export default function Page() {
  return <LogHome />;
}
