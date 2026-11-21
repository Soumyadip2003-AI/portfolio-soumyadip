import { projects } from "@/app/content";

/* Live status for the project cards. Checked here, never from a visitor's browser:
   the CDN keeps this response for 10 minutes (s-maxage), so however many people
   visit, each demo gets at most one check per 10 minutes per region and every
   visitor reads that saved result. */
export const dynamic = "force-dynamic";

const SLOW_MS = 3000;
const TIMEOUT_MS = 10_000;

export type ProjectState = "live" | "slow" | "waking" | "down";
export type ProjectStatus = { name: string; state: ProjectState; ms: number | null };

async function check(name: string, url: string): Promise<ProjectStatus> {
  const started = Date.now();
  try {
    const res = await fetch(url, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });
    await res.body?.cancel();
    const ms = Date.now() - started;
    /* A 4xx still proves the server is up (a bot wall or a missing page); only a
       5xx means the app itself is failing. */
    if (res.status >= 500) return { name, state: "down", ms: null };
    return { name, state: ms > SLOW_MS ? "slow" : "live", ms };
  } catch {
    /* Free hosts that sleep, like Render, time out while the app wakes up. */
    return { name, state: /\.onrender\.com/.test(url) ? "waking" : "down", ms: null };
  }
}

export async function GET() {
  const results = await Promise.all(projects.filter((p) => p.demo).map((p) => check(p.name, p.demo)));
  return Response.json(
    { checkedAt: new Date().toISOString(), results },
    { headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=600" } },
  );
}
