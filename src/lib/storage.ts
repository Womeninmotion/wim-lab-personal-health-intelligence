import type { SavedLog, TaskFeedback } from "@/lib/types";

export const STORAGE_KEY = "wim-lab-phi-demo-v1";

export type PersistedState = {
  logs: SavedLog[];
  tasks: Record<string, TaskFeedback>;
};

function isLog(value: unknown): value is SavedLog {
  if (!value || typeof value !== "object") return false;
  const log = value as SavedLog;
  return (
    typeof log.id === "string" &&
    typeof log.rawText === "string" &&
    typeof log.category === "string" &&
    Array.isArray(log.fields)
  );
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || !Array.isArray(parsed.logs) || !parsed.tasks) return null;
    return {
      logs: parsed.logs.filter(isLog),
      tasks: parsed.tasks,
    };
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
