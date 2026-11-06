"use client";

import { useEffect, useState } from "react";
import { defaultPersonalGoals, readPersonalGoals, savePersonalGoals, type PersonalGoals } from "@/lib/personalGoals";

export function usePersonalGoals() {
  const [goals, setGoals] = useState<PersonalGoals>(defaultPersonalGoals);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const update = () => setGoals(readPersonalGoals());
    update();
    window.addEventListener("wim-goals-updated", update);
    (async () => {
      try {
        const response = await fetch("/api/private/goals", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as { goals?: Partial<PersonalGoals> | null };
        if (active && data.goals) savePersonalGoals({ ...defaultPersonalGoals, ...data.goals });
      } catch { /* leave local cache visible while offline */ }
      finally { if (active) setReady(true); }
    })();
    return () => { active = false; window.removeEventListener("wim-goals-updated", update); };
  }, []);
  return { goals, ready };
}
