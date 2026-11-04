export const personalGoalsStorageKey = "wim-lab-personal-goals-v1";

export type PersonalGoals = {
  displayName: string;
  eventName: string;
  eventDate: string;
  goalWeight: string;
  dailySteps: string;
};

export const defaultPersonalGoals: PersonalGoals = {
  displayName: "Wendy",
  eventName: "UTMB 50K 越野赛",
  eventDate: "", // 未核实赛事日期，必须由本人确认
  goalWeight: "53", // 此前讨论过的目标，需要本人确认或更新
  dailySteps: "8000",
};

export function readPersonalGoals(): PersonalGoals {
  if (typeof window === "undefined") return defaultPersonalGoals;
  try {
    const raw = localStorage.getItem(personalGoalsStorageKey);
    if (!raw) return defaultPersonalGoals;
    const parsed = JSON.parse(raw) as Partial<PersonalGoals>;
    return { ...defaultPersonalGoals, ...parsed };
  } catch {
    return defaultPersonalGoals;
  }
}

export function savePersonalGoals(goals: PersonalGoals) {
  if (typeof window === "undefined") return;
  localStorage.setItem(personalGoalsStorageKey, JSON.stringify(goals));
  window.dispatchEvent(new Event("wim-goals-updated"));
}

export function daysUntil(dateString: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const event = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(event.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return Math.ceil((event.getTime() - today.getTime()) / 86400000);
}
