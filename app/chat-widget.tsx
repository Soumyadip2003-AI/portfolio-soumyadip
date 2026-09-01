"use client";

import { useEffect, useRef, useState } from "react";
import { chat } from "./content";
import { parseLinks } from "./links";

type Msg = { role: "user" | "model"; text: string };



/* The answer can carry a resume, demo, or repo URL. Rendered as plain text nobody
   can click it, so turn the links into real anchors. The splitting itself lives in
   links.ts, where it is tested. */
function withLinks(text: string) {
  return parseLinks(text).map((piece, i) =>
    piece.kind === "text" ? (
      piece.value
    ) : (
      <span key={i}>
        <a
          href={piece.href}
          target="_blank"
          rel="noreferrer"
          className="break-all underline underline-offset-2 transition-colors hover:text-ink"
        >
          {piece.href}
        </a>
        {piece.tail}
      </span>
    ),
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* One id per page load, so the notifications for a visit can be grouped. */
  const sessionRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, error]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      /* Escape has to hand focus back to the launcher that opened the panel.
         Without this it lands on <body> and a keyboard visitor has to tab in from
         the top of the page again. Bound to open so it cannot steal focus from
         someone pressing Escape with the panel already closed. */
      launcherRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(raw: string) {
    const q = raw.trim();
    if (!q || busy) return;

    if (!sessionRef.current) {
      sessionRef.current =
        globalThis.crypto?.randomUUID?.() ?? String(Date.now()) + Math.random().toString(16).slice(2);
    }

    const next: Msg[] = [...msgs, { role: "user", text: q }];
    setMsgs(next);
    setInput("");
    setError(null);
    setBusy(true);

    try {
      /* busy is what disables Send and blocks the next question, and only the
         finally below clears it. A request that never settles therefore kills the
         widget for the rest of the visit, so it is never allowed to hang: the
         server answers within its own deadline, and this covers the case where the
         connection itself stalls and no response ever arrives. */
      const res = await fetch("/api/chat", {
        method: "POST",
        signal: AbortSignal.timeout(25_000),
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, session: sessionRef.current }),
      });
      /* The route always answers JSON, but a platform error page in front of it
         would not, and parsing that threw the raw SyntaxError into the panel. */
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.text) {
        setError(data?.error || "The assistant did not reply. Please try again.");
        return;
      }
      setMsgs([...next, { role: "model", text: data.text }]);
    } catch {
      /* Only transport failures reach here: an aborted fetch throws a DOMException
         reading "signal timed out", a dropped connection a TypeError reading
         "Failed to fetch". Neither is copy to put in front of a visitor, and the
         server's own wording is handled above, where it still has the response. */
      setError("Could not reach the assistant. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        className="glass fixed bottom-5 right-5 z-[70] rounded-full px-5 py-3 text-sm text-ink transition-transform duration-200 hover:-translate-y-px active:scale-[0.98]"
      >
        {open ? chat.launcherClose : chat.launcherOpen}
      </button>

      {/* Panel */}
      <div
        id="assistant-panel"
        hidden={!open}
        /* The cap belongs on the panel, not just on the message list: bounding only
           the list let header, note and form push the whole thing past the top of a
           short viewport, and at 740x360 the title was clipped 48px off-screen.
           6.5rem clears the launcher offset below plus a margin above. */
        className="fixed bottom-20 right-5 z-[70] flex max-h-[calc(100dvh-6.5rem)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-[20px] border border-line bg-card shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
          <p className="font-display text-lg text-ink">{chat.panelTitle}</p>
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">{chat.panelBadge}</span>
        </div>

        <div
          ref={listRef}
          aria-live="polite"
          className="flex max-h-[46vh] min-h-0 flex-col gap-3 overflow-y-auto px-5 py-4"
        >
          {msgs.length === 0 && !error ? (
            <div>
              <p className="text-sm leading-relaxed text-ink-dim">
                {chat.emptyState}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {chat.starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-dim transition-colors hover:border-white/40 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {msgs.map((m, i) => (
            <p
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-[14px] bg-ink px-3.5 py-2 text-sm text-bg"
                  : "max-w-[90%] text-sm leading-relaxed text-ink-dim"
              }
            >
              {m.role === "model" ? withLinks(m.text) : m.text}
            </p>
          ))}

          {busy ? <p className="text-sm text-ink-faint">Thinking...</p> : null}
          {error ? <p className="text-sm text-ink-faint">{error}</p> : null}
        </div>

        <p className="px-5 pb-1 text-[10px] leading-snug text-ink-faint">{chat.privacyNote}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-line px-3 py-3"
        >
          <label htmlFor="assistant-input" className="sr-only">
            Your question
          </label>
          <input
            id="assistant-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question"
            maxLength={500}
            className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-white/40"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="glass shrink-0 rounded-full px-4 py-2.5 text-sm text-ink transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}

export default ChatWidget;
