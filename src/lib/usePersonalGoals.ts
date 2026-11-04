"use client";

import { useEffect, useState } from "react";
import { defaultPersonalGoals, readPersonalGoals, type PersonalGoals } from "@/lib/personalGoals";

export function usePersonalGoals() {
  const [goals, setGoals] = useState<PersonalGoals>(defaultPersonalGoals);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const update = () => setGoals(readPersonalGoals());
    update();
    setReady(true);
    window.addEventListener("wim-goals-updated", update);
    return () => window.removeEventListener("wim-goals-updated", update);
  }, []);
  return { goals, ready };
}
