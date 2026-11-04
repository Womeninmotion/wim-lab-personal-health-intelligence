import type { Metadata } from "next";
import { TodayView } from "@/components/today/TodayView";

export const metadata: Metadata = {
  title: "今日",
};

export default function Page() {
  return <TodayView />;
}
