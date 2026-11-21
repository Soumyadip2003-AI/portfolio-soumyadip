"use client";

import { useEffect, useState } from "react";
import type { ProjectStatus as Status } from "./api/status/route";

type Report = { checkedAt: string; results: Status[] };

/* One request for every card on the page. */
let pending: Promise<Report | null> | null = null;
const load = () =>
  (pending ??= fetch("/api/status")
    .then((r) => (r.ok ? (r.json() as Promise<Report>) : null))
    .catch(() => null));

function ago(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "checked just now";
  return min < 60 ? `checked ${min} min ago` : `checked ${Math.floor(min / 60)} h ago`;
}

const time = (ms: number) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`);

/* The state is always in words; the dot's colour and shape only repeat it. */
export function ProjectStatus({ name }: { name: string }) {
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => {
    let live = true;
    load().then((r) => live && setReport(r));
    return () => {
      live = false;
    };
  }, []);

  const s = report?.results.find((r) => r.name === name);
  if (!report || !s) return <p className="min-h-5" aria-hidden="true" />;

  const [word, rest, dot] =
    s.state === "live"
      ? ["Live.", `Responded in ${time(s.ms ?? 0)}, ${ago(report.checkedAt)}`, "rounded-full bg-emerald-300"]
      : s.state === "slow"
        ? ["Slow.", `Responded in ${time(s.ms ?? 0)}, ${ago(report.checkedAt)}`, "rounded-[2px] bg-amber-300"]
        : s.state === "waking"
          ? ["Waking up.", "Free host, the first visit can take about 30 s", "rounded-[2px] bg-amber-300"]
          : ["Not responding.", ago(report.checkedAt).replace(/^c/, "C"), "rounded-full border-[1.5px] border-ink"];

  return (
    <p className="flex min-h-5 items-center gap-2.5 text-[13px] text-ink-dim">
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 ${dot}`} />
      <span>
        <strong className="font-medium text-ink">{word}</strong> {rest}
      </span>
    </p>
  );
}
