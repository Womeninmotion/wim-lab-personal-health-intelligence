"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  resetDemoStore,
  setTaskFeedback,
  upsertLog,
  useDemoStore,
} from "@/lib/demoStore";
import type { DrawerState, LogPreset, SavedLog, TaskFeedback } from "@/lib/types";

type AppStateValue = {
  logs: SavedLog[];
  tasks: Record<string, TaskFeedback>;
  drawer: DrawerState;
  openLog: (preset?: LogPreset) => void;
  openAsk: (question?: string) => void;
  openEvidence: () => void;
  openGuidance: (priorityId: string) => void;
  closeDrawer: () => void;
  saveLog: (log: SavedLog) => void;
  setTask: (id: string, feedback: TaskFeedback | null) => void;
  resetDemo: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

let logNonce = 0;

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const persisted = useDemoStore();
  const [drawer, setDrawer] = useState<DrawerState>({ name: "closed" });

  const openLog = useCallback((preset: LogPreset = {}) => {
    logNonce += 1;
    setDrawer({ name: "log", preset, nonce: logNonce });
  }, []);

  const openAsk = useCallback((question?: string) => {
    setDrawer({ name: "ask", question });
  }, []);

  const openEvidence = useCallback(() => {
    setDrawer({ name: "evidence" });
  }, []);

  const openGuidance = useCallback((priorityId: string) => {
    setDrawer({ name: "guidance", priorityId });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer({ name: "closed" });
  }, []);

  const value = useMemo(
    () => ({
      logs: persisted.logs,
      tasks: persisted.tasks,
      drawer,
      openLog,
      openAsk,
      openEvidence,
      openGuidance,
      closeDrawer,
      saveLog: upsertLog,
      setTask: setTaskFeedback,
      resetDemo: resetDemoStore,
    }),
    [persisted.logs, persisted.tasks, drawer, openLog, openAsk, openEvidence, openGuidance, closeDrawer],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return value;
}
