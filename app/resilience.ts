/* The recovery logic behind the assistant and the "Break this site" demo: retry
   with backoff, read the sources an answer cites, and answer from saved facts when
   the live model is down. No imports, so it runs under node --test as it is. See
   resilience.test.ts. */

export type Fact = { label: string; text: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* Runs `attempt` until it succeeds, waiting delays[n] before retry n+1. Only
   errors `retryable` accepts are retried; any other error, or running out of
   delays, rethrows the last error. */
export async function withRecovery<T>(
  attempt: (n: number) => Promise<T>,
  opts: {
    delays: number[];
    retryable: (error: unknown) => boolean;
    onRetry?: (n: number, delayMs: number, error: unknown) => void;
  },
): Promise<T> {
  for (let n = 0; ; n++) {
    try {
      return await attempt(n);
    } catch (error) {
      const delay = opts.delays[n];
      if (delay === undefined || !opts.retryable(error)) throw error;
      opts.onRetry?.(n + 1, delay, error);
      await sleep(delay);
    }
  }
}

/* The model ends each answer with "Sources: <label>; <label>" or "Sources: none".
   That line is taken off the text, and only labels that really exist are kept, so
   a made-up source can never show up under an answer. null means the model wrote
   no sources line at all. */
export function splitSources(raw: string, known: string[]): { text: string; sources: string[] | null } {
  const lines = raw.trimEnd().split("\n");
  const at = lines.findLastIndex((l) => /^\s*sources?\s*:/i.test(l));
  if (at === -1) return { text: raw.trim(), sources: null };
  const value = lines[at].replace(/^\s*sources?\s*:/i, "").trim();
  const text = lines.filter((_, i) => i !== at).join("\n").trim();
  if (/^none\.?$/i.test(value)) return { text, sources: [] };
  const byLower = new Map(known.map((k) => [k.toLowerCase(), k]));
  const sources = [
    ...new Set(
      value
        .split(";")
        .map((s) => byLower.get(s.replace(/[[\].]/g, "").trim().toLowerCase()))
        .filter((s): s is string => Boolean(s)),
    ),
  ];
  return { text, sources };
}

const STOP = new Set(
  "the and for are was what who how his him does did has have with this that about from can when where which you your any tell give show please".split(" "),
);

/* The fallback when the live model is down: the saved fact that shares the most
   words with the question. A label match counts three times, so "his skills"
   lands on a Skills fact before a project that merely mentions skills. null when
   nothing matches at all. */
export function localAnswer(question: string, facts: Fact[]): { text: string; source: string } | null {
  const words = question
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((w) => w.replace(/\.+$/, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
  let best: { fact: Fact; score: number } | null = null;
  for (const fact of facts) {
    const label = fact.label.toLowerCase();
    const body = fact.text.toLowerCase();
    const score = words.reduce((sum, w) => sum + (label.includes(w) ? 3 : 0) + (body.includes(w) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { fact, score };
  }
  if (!best) return null;
  const flat = best.fact.text.replace(/^- /gm, "").replace(/\s*\n\s*/g, " ").trim();
  const text = flat.length > 280 ? `${flat.slice(0, 280).replace(/\s+\S*$/, "")}...` : flat;
  return { text, source: best.fact.label };
}
