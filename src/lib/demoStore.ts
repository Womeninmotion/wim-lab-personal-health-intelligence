"use client";

import { useSyncExternalStore } from "react";
import {
  STORAGE_KEY,
  clearState,
  loadState,
  saveState,
  type PersistedState,
} from "@/lib/storage";
import type { SavedLog, TaskFeedback } from "@/lib/types";

const CHANGE = "wim-lab-phi-demo-change";
const empty: PersistedState = { logs: [], tasks: {} };

let cacheRaw: string | null | undefined;
let cacheState: PersistedState = empty;

function read(): PersistedState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cacheRaw) return cacheState;
  cacheRaw = raw;
  if (!raw) {
    cacheState = empty;
    return empty;
  }
  cacheState = loadState() ?? empty;
  return cacheState;
}

function publish(next: PersistedState) {
  saveState(next);
  cacheRaw = localStorage.getItem(STORAGE_KEY);
  cacheState = next;
  window.dispatchEvent(new Event(CHANGE));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useDemoStore() {
  return useSyncExternalStore(subscribe, read, () => empty);
}

export function upsertLog(log: SavedLog) {
  const current = read();
  const exists = current.logs.some((item) => item.id === log.id);
  const logs = exists
    ? current.logs.map((item) => (item.id === log.id ? log : item))
    : [log, ...current.logs];
  publish({ ...current, logs });
}

export function setTaskFeedback(id: string, feedback: TaskFeedback | null) {
  const current = read();
  const tasks = { ...current.tasks };
  if (feedback) tasks[id] = feedback;
  else delete tasks[id];
  publish({ ...current, tasks });
}

export function resetDemoStore() {
  clearState();
  cacheRaw = null;
  cacheState = empty;
  window.dispatchEvent(new Event(CHANGE));
}
