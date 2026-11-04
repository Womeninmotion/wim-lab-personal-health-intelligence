"use client";

import { useState } from "react";
import { AppStateProvider } from "@/components/state/AppState";
import { AskDrawer } from "@/components/drawers/AskDrawer";
import { EvidenceDrawer } from "@/components/drawers/EvidenceDrawer";
import { GuidanceDrawer } from "@/components/drawers/GuidanceDrawer";
import { LogDrawer } from "@/components/drawers/LogDrawer";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";

function Frame({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-full bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2"
      >
        跳到主要内容
      </a>
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
      <div className="lg:pl-[240px]">
        <TopBar onMenu={() => setNavOpen(true)} />
        <main id="main" className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
      <LogDrawer />
      <AskDrawer />
      <EvidenceDrawer />
      <GuidanceDrawer />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <Frame>{children}</Frame>
    </AppStateProvider>
  );
}
