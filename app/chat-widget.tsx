"use client";

import { useEffect, useRef, useState } from "react";
import { chat } from "./content";

type Msg = { role: "user" | "model"; text: string };



/* The answer can carry a resume, demo, or repo URL. Rendered as plain text nobody
   can click it, so split the string and turn the links into real anchors.

   The trailing punctuation split matters: a sentence ending "...at <url>." would
   otherwise fold the full stop into the href and 404 on click. */
function withLinks(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
    if (!/^https?:\/\//.test(part)) return part;
    const [, href, tail] = part.match(/^(.*?)([.,;:!?)\]]*)$/s) ?? [, part, ""];
    return (
      <span key={i}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="break-all underline underline-offset-2 transition-colors hover:text-ink"
        >
          {href}
        </a>
        {tail}
      </span>
    );
  });
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, error]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, session: sessionRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setMsgs([...next, { role: "model", text: data.text }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
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
        className="fixed bottom-20 right-5 z-[70] flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-[20px] border border-line bg-card shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
          <p className="font-display text-lg text-ink">{chat.panelTitle}</p>
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">Gemini</span>
        </div>

        <div
          ref={listRef}
          aria-live="polite"
          className="flex max-h-[46vh] min-h-[180px] flex-col gap-3 overflow-y-auto px-5 py-4"
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
