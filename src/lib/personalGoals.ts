export const personalGoalsStorageKey = "wim-lab-personal-goals-v1";

export type PersonalGoals = {
  displayName: string;
  eventName: string;
  eventDate: string;
  goalWeight: string;
  dailySteps: string;
  startWeight: string;
  startDate: string;
  startBodyFat: string;
  goalBodyFat: string;
  weeklyRunKm: string;
  weeklyAscentM: string;
  targetWeekStart: string;
};

export const defaultPersonalGoals: PersonalGoals = {
  displayName: "Wendy",
  eventName: "UTMB 50K 越野赛",
  eventDate: "2027-01-09",
  goalWeight: "51",
  dailySteps: "8000",
  startWeight: "",
  startDate: "",
  startBodyFat: "",
  goalBodyFat: "",
  weeklyRunKm: "",
  weeklyAscentM: "",
  targetWeekStart: "",
};

export function readPersonalGoals(): PersonalGoals {
  if (typeof window === "undefined") return defaultPersonalGoals;
  try {
    const raw = localStorage.getItem(personalGoalsStorageKey);
    if (!raw) return defaultPersonalGoals;
    return { ...defaultPersonalGoals, ...(JSON.parse(raw) as Partial<PersonalGoals>) };
  } catch { return defaultPersonalGoals; }
}

// Local cache is a convenience only. Saving to Supabase is the authoritative operation.
export function savePersonalGoals(goals: PersonalGoals) {
  if (typeof window === "undefined") return;
  localStorage.setItem(personalGoalsStorageKey, JSON.stringify(goals));
  window.dispatchEvent(new Event("wim-goals-updated"));
}

export function weightGoalProgress(start: number, current: number, target: number) {
  if (![start, current, target].every(Number.isFinite) || start <= target || target <= 0 || current <= 0) return null;
  const total = start - target;
  const lost = start - current;
  const remaining = Math.max(0, current - target);
  return {
    total, lost, remaining,
    percent: Math.min(100, Math.max(0, (lost / total) * 100)),
    reached: current <= target,
  };
}

export function daysUntil(dateString: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const event = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(event.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return Math.ceil((event.getTime() - today.getTime()) / 86400000);
}
