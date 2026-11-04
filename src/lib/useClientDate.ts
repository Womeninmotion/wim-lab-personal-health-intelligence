"use client";

import { useSyncExternalStore } from "react";
import { greetingForHour, localDateParts } from "@/lib/format";

type Clock = {
  greeting: string;
  dateText: string;
  timeZone: string;
  iso: string;
};

let clock: Clock | null = null;

function emptySubscribe() {
  return () => {};
}

function getClock() {
  if (!clock) {
    const now = new Date();
    const parts = localDateParts(now);
    clock = {
      greeting: greetingForHour(now.getHours()),
      dateText: parts.dateText,
      timeZone: parts.timeZone,
      iso: now.toISOString(),
    };
  }
  return clock;
}

export function useClientClock() {
  return useSyncExternalStore(emptySubscribe, getClock, () => null);
}
