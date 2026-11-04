"use client";

import { useEffect, useId, useRef } from "react";

type DrawerProps = {
  open: boolean;
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Drawer({ open, eyebrow, title, onClose, children }: DrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const root = panelRef.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((item) => !item.hasAttribute("disabled") && item.tabIndex !== -1);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="关闭面板"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative flex h-full w-full max-w-[440px] flex-col bg-white shadow-[-12px_0_40px_rgba(35,24,21,0.08)] outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p lang="en" className="font-display text-[11px] font-semibold tracking-[0.18em] text-ink/60">
              {eyebrow}
            </p>
            <h2 id={titleId} className="mt-1 font-display text-xl font-semibold tracking-tight">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-line px-3 py-1.5 text-sm hover:border-ink"
          >
            关闭
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  );
}
