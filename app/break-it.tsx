"use client";

/* "Break this site": switches chaos mode on, sends a real question through the
   assistant's own recovery path (askAssistant), and logs each step with its
   measured time. Chaos switches itself off 5 s after recovery, and a reload
   always starts clean, so nobody is left browsing a broken site. */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { askAssistant, chaos } from "./assistant";
import { breakIt } from "./content";

type Phase = "idle" | "running" | "recovered" | "restored";
const AUTO_RESTORE_MS = 5000;

export function useChaos() {
  return useSyncExternalStore(chaos.subscribe, chaos.get, () => false);
}

export function BreakIt() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<{ at: string; text: string }[]>([]);
  const [recoveredIn, setRecoveredIn] = useState(0);
  const chaosOn = useChaos();
  const start = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      clearTimeout(timer.current);
      chaos.set(false);
    };
  }, []);

  const add = (text: string) =>
    setLines((l) => [...l, { at: `${((performance.now() - start.current) / 1000).toFixed(3)}s`, text }]);

  function restore() {
    clearTimeout(timer.current);
    if (!chaos.get()) return;
    chaos.set(false);
    add("chaos off: site back to normal");
    setPhase("restored");
  }

  async function run() {
    if (phase === "running") return;
    clearTimeout(timer.current);
    start.current = performance.now();
    setLines([]);
    setOpen(true);
    setPhase("running");
    chaos.set(true);
    add("chaos: chatbot API cut (503)");
    add("chaos: requests slowed to 3G latency");
    try {
      const answer = await askAssistant([{ role: "user", text: breakIt.probeQuestion }], "chaos-demo", add);
      const ms = performance.now() - start.current;
      add(`recovered. Answered from ${answer.sources?.[0] ?? "saved facts"}, no error page.`);
      setRecoveredIn(ms);
      setPhase("recovered");
      timer.current = setTimeout(restore, AUTO_RESTORE_MS);
    } catch {
      restore();
    }
  }

  function close() {
    restore();
    setOpen(false);
  }

  const status =
    phase === "running"
      ? { text: "Recovering", dot: "rounded-[2px] bg-amber-300" }
      : phase === "recovered"
        ? { text: `Recovered in ${(recoveredIn / 1000).toFixed(1)} s`, dot: "rounded-full bg-emerald-300" }
        : { text: "Healthy", dot: "rounded-full bg-emerald-300" };

  return (
    <>
      <p className="mt-8 text-sm text-ink/80 [text-shadow:0_1px_16px_rgba(8,8,13,0.4)]">
        {breakIt.prompt}{" "}
        <button
          type="button"
          onClick={run}
          disabled={phase === "running"}
          className="ml-1 inline-flex items-center gap-2 rounded-full border border-dashed border-ink/55 bg-bg/30 px-4 py-2 text-sm text-ink transition-colors hover:border-ink disabled:opacity-60"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
          </svg>
          {breakIt.button}
        </button>
      </p>

      {mounted && open
        ? createPortal(
            <section
              aria-label="Incident log"
              className="fixed bottom-20 left-5 right-5 z-[65] rounded-[20px] border border-line bg-card p-5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] md:bottom-5 md:right-auto md:w-[460px]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Incident log</p>
                <div className="flex items-center gap-2">
                  <span role="status" className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-ink">
                    <span aria-hidden="true" className={`h-2 w-2 ${status.dot}`} />
                    {status.text}
                  </span>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close incident log"
                    className="grid h-8 w-8 place-items-center rounded-full text-ink-dim transition-colors hover:text-ink"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              {chaosOn ? (
                <p className="mt-3 rounded-[12px] border border-dashed border-white/25 px-3 py-2 text-xs leading-relaxed text-ink-dim">
                  <strong className="font-medium text-ink">Chaos is on.</strong> {breakIt.chaosNote}
                </p>
              ) : null}

              <ol className="mt-3 flex flex-col gap-1.5 font-mono text-xs leading-relaxed">
                {lines.map((l, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 text-ink-faint">{l.at}</span>
                    <span className="text-ink-dim">{l.text}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <p className="max-w-[30ch] text-[11px] leading-snug text-ink-faint">{breakIt.footnote}</p>
                {phase === "recovered" ? (
                  <button type="button" onClick={restore} className="rounded-full border border-line px-4 py-2 text-xs text-ink transition-colors hover:border-white/40">
                    Restore now (auto in 5 s)
                  </button>
                ) : phase === "restored" ? (
                  <button type="button" onClick={run} className="rounded-full border border-line px-4 py-2 text-xs text-ink transition-colors hover:border-white/40">
                    Break it again
                  </button>
                ) : null}
              </div>
            </section>,
            document.body,
          )
        : null}
    </>
  );
}
