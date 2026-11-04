import { GoalsSection } from "@/components/today/GoalsSection";
import { InterpretationSection } from "@/components/today/InterpretationSection";
import { LookingAhead } from "@/components/today/LookingAhead";
import { MorningGreeting } from "@/components/today/MorningGreeting";
import { NeedsInput } from "@/components/today/NeedsInput";
import { TodayFocus } from "@/components/today/TodayFocus";
import { TodayPlan } from "@/components/today/TodayPlan";
import { YesterdaySection } from "@/components/today/YesterdaySection";

export function TodayView() {
  return (
    <>
      <MorningGreeting />
      <GoalsSection />
      <YesterdaySection />
      <InterpretationSection />
      <TodayFocus />
      <TodayPlan />
      <LookingAhead />
      <NeedsInput />
    </>
  );
}
