/* Every question to the assistant goes through askAssistant, the chat widget's and
   the "Break this site" demo's alike, so the demo exercises the real recovery path:
   retry with backoff, then answer from saved profile facts if the live model stays
   down. Chaos mode injects the failures into this same path. */

import { factSources, profile } from "./content";
import { localAnswer, withRecovery } from "./resilience";

/* ---- Chaos mode: one switch the whole page can watch. ------------------- */

let chaosOn = false;
const listeners = new Set<() => void>();

export const chaos = {
  get: () => chaosOn,
  set(on: boolean) {
    chaosOn = on;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};

/* What chaos does to a request: 700 ms of latency, then the API is unreachable. */
const CHAOS_LATENCY_MS = 700;

/* ---- Asking ------------------------------------------------------------- */

export type Msg = { role: "user" | "model"; text: string; sources?: string[] | null; fallback?: boolean };
export type Answer = { text: string; sources: string[] | null; fallback: boolean };

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/* Worth another try: the service is down or overloaded, or the connection
   dropped. A 4xx (bad input, rate limit) would only fail the same way again. */
const retryable = (e: unknown) =>
  (e instanceof HttpError && e.status >= 502) || (e instanceof TypeError && !(e instanceof DOMException));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function askAssistant(
  messages: Msg[],
  session: string,
  onStep?: (text: string) => void,
): Promise<Answer> {
  /* One deadline across every attempt, so retries cannot stack up into a wait
     longer than a visitor would sit through. */
  const deadline = AbortSignal.timeout(30_000);
  const payload = messages.map(({ role, text }) => ({ role, text }));

  try {
    return await withRecovery(
      async () => {
        if (chaos.get()) {
          await sleep(CHAOS_LATENCY_MS);
          throw new HttpError(503, "Injected by chaos mode");
        }
        const res = await fetch("/api/chat", {
          method: "POST",
          signal: deadline,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: payload, session }),
        });
        /* The route always answers JSON, but a platform error page in front of it
           would not. */
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.text) {
          throw new HttpError(res.ok ? 502 : res.status, data?.error || "The assistant did not reply. Please try again.");
        }
        return { text: data.text as string, sources: (data.sources as string[] | null) ?? null, fallback: false };
      },
      {
        delays: [200, 400],
        retryable,
        onRetry: (n, delay, e) =>
          onStep?.(`ask: failed${e instanceof HttpError ? `, ${e.status}` : ""}. Retry ${n} in ${delay} ms`),
      },
    );
  } catch (e) {
    if (!retryable(e)) {
      /* A deadline or a 4xx: say what happened rather than guess an answer. */
      throw new Error(
        e instanceof HttpError ? e.message : "Could not reach the assistant. Please try again.",
      );
    }
    onStep?.("ask: live AI down. Answering from saved profile facts");
    const question = [...messages].reverse().find((m) => m.role === "user")?.text ?? "";
    const found = localAnswer(question, factSources());
    return found
      ? { text: found.text, sources: [found.source], fallback: true }
      : {
          text: `The live assistant is down and his profile does not cover that. You can email him at ${profile.email}.`,
          sources: [],
          fallback: true,
        };
  }
}
