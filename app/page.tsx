"use client";

import type { CSSProperties, ReactNode } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { BreakIt } from "./break-it";
import { ChatWidget } from "./chat-widget";
import { ProjectStatus } from "./project-status";
import {
  about,
  certifications,
  contact,
  education,
  experience,
  footer,
  hero,
  manifesto,
  metrics,
  metricsSection,
  nav,
  navButton,
  openSource,
  openSourceHeading,
  profile,
  projects,
  projectsHeading,
  recruiter,
  skills,
  skillsHeading,
  type Project,
} from "./content";

/* Every string on this page comes from content.ts. Nothing below is content. */

/* Gradient used when a project has no screenshot. */
const TINTS: Record<Project["fallbackTint"], string> = {
  sky: "sky scale-125",
  aurora: "aurora scale-125",
  night: "night scale-125",
};

/* Plain-English image focus in content.ts, Tailwind class here. */
const FOCUS: Record<Project["imageFocus"], string> = {
  top: "object-top",
  center: "object-center",
  left: "object-left",
  right: "object-right",
  bottom: "object-bottom",
};

/* ------------------------------------------------------------------ */
/* shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      /* Reduced motion takes away the travel, never the arrival. Branching here to
         drop whileInView blanked the page below the hero: useReducedMotion is null
         on the server and on the first client render, so opacity 0 was committed
         before it resolved to true, and with the target then gone nothing ever
         animated it back. Keep one unconditional target and only stop the clock. */
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={reduce ? { duration: 0 } : { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const PILL =
  "glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-ink transition-[transform,background-color] duration-200 hover:bg-white/12 active:scale-[0.98]";

const PILL_GHOST =
  "inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm text-ink/90 transition-colors duration-200 hover:text-ink hover:border-white/45";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-faint">{children}</p>
  );
}


/* ------------------------------------------------------------------ */
/* sections                                                            */
/* ------------------------------------------------------------------ */

/* Where each piece lands when "Break this site" knocks it down: drift, drop,
   spin and timing, read by the .chaos-fall rules in globals.css. Seeded by index,
   not Math.random, so the server and the browser render the same values. */
function fallVars(i: number): CSSProperties {
  const r = (k: number) => {
    const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    "--fall-x": `${Math.round((r(1) * 2 - 1) * 140)}px`,
    "--fall-y": `${Math.round(58 + r(2) * 30)}vh`,
    "--fall-r": `${Math.round((r(3) * 2 - 1) * 80)}deg`,
    "--fall-d": `${(r(4) * 0.4).toFixed(2)}s`,
    "--heal-d": `${(r(5) * 0.6).toFixed(2)}s`,
  } as CSSProperties;
}

/* Each word its own piece, so a headline falls apart word by word. */
function FallWords({ text, seed }: { text: string; seed: number }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span className="chaos-fall inline-block" style={fallVars(seed + i)}>
        {word}
      </span>
    </Fragment>
  ));
}

/* Recruiter mode lives in the URL (?view=recruiter), so a recruiter can share the
   short version and a reload keeps it. */
function useRecruiterMode() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(new URLSearchParams(window.location.search).get("view") === "recruiter"), []);
  const set = (next: boolean) => {
    setOn(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("view", "recruiter");
    else url.searchParams.delete("view");
    window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0 });
  };
  return [on, set] as const;
}

function RecruiterSwitch({ on, onChange, className = "", style }: { on: boolean; onChange: (v: boolean) => void; className?: string; style?: CSSProperties }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={style}
      className={`items-center gap-2.5 whitespace-nowrap text-sm text-ink-dim transition-colors hover:text-ink ${className}`}
    >
      {recruiter.switchLabel}
      <span
        aria-hidden="true"
        className={`relative h-[22px] w-[38px] shrink-0 rounded-full border transition-colors ${
          on ? "border-transparent bg-ink" : "border-white/30 bg-transparent"
        }`}
      >
        <span
          className={`absolute top-[2px] h-4 w-4 rounded-full transition-[left,background-color] duration-200 ${
            on ? "left-[18px] bg-bg" : "left-[2px] bg-ink-dim"
          }`}
        />
      </span>
    </button>
  );
}

function Nav({ recruiterOn, setRecruiter }: { recruiterOn: boolean; setRecruiter: (v: boolean) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 80));

  /* "change" only fires on a later scroll, so landing already scrolled left the
     bar transparent over the content: a shared /#projects link, a reload with the
     position restored, or any in-page anchor followed before hydration. Read the
     position once on mount instead of waiting to be told about it. */
  useEffect(() => setScrolled(scrollY.get() > 80), [scrollY]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-bg/80 backdrop-blur-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-5 md:px-10 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <a
          href="#top"
          className="chaos-fall whitespace-nowrap font-display text-base text-ink sm:text-lg md:text-xl"
          style={fallVars(1)}
        >
          {profile.fullName}<sup className="ml-0.5 align-super text-[0.6em]">®</sup>
        </a>
        <nav className="hidden items-center gap-8 justify-self-center text-sm text-ink-dim lg:flex">
          {(recruiterOn ? [] : nav).map((n, i) => (
            <a key={n.href} href={n.href} className="chaos-fall transition-colors hover:text-ink" style={fallVars(10 + i)}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 justify-self-end">
          {/* Below lg only: from lg the nav above is visible. <details> is the
              entire menu. It opens and closes itself, reads as a button to a screen
              reader, and takes keyboard focus, so no state, no effect and no focus
              handling has to be written, and it works before hydration. The one
              thing it will not do is close when a link inside it is followed. */}
          <details className="chaos-fall relative lg:hidden" style={fallVars(8)}>
            <summary
              className={`${PILL} cursor-pointer list-none !px-4 !py-2.5 [&::-webkit-details-marker]:hidden`}
            >
              Menu
            </summary>
            <nav
              onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}
              className="absolute right-0 top-full mt-2 flex min-w-[10rem] flex-col overflow-hidden rounded-[14px] border border-line bg-card"
            >
              {(recruiterOn ? [] : nav).map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="px-5 py-3 text-sm text-ink-dim transition-colors hover:text-ink"
                >
                  {n.label}
                </a>
              ))}
              <RecruiterSwitch
                on={recruiterOn}
                onChange={setRecruiter}
                className="flex justify-between border-t border-line px-5 py-3"
              />
            </nav>
          </details>

          <RecruiterSwitch on={recruiterOn} onChange={setRecruiter} className="chaos-fall mr-3 hidden min-h-11 lg:inline-flex" style={fallVars(17)} />

          <a href={navButton.href} className={`${PILL} chaos-fall shrink-0 !px-5 !py-2.5`} style={fallVars(18)}>
            {navButton.label}
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* Browsers pause this video on their own: backgrounded tab, iOS Low Power
       Mode, memory pressure, offscreen on some phones. autoplay only ever fires
       once, so without this it stays stopped. Put it back in the right state. */
    const sync = () => {
      if (reduce || document.hidden) video.pause();
      else void video.play().catch(() => {});
    };

    sync();
    video.addEventListener("pause", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      video.removeEventListener("pause", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduce]);

  return (
    <section id="top" ref={ref} className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* Gradient fallback, sits behind the video for load / decode / no-video. */}
      <div className="sky absolute inset-0 -z-20" />

      <motion.video
        ref={videoRef}
        style={{ y: reduce ? 0 : mediaY }}
        className="absolute inset-0 -z-10 h-full w-full scale-105 object-cover"
        src={hero.video}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* Scrims: shade for the nav, a floor under the copy, and a base fade into the
          page. The middle stop used to be transparent, which assumed the video was
          dark behind the text. It is not: the sunset horizon is the brightest band
          in the clip and it lands exactly on the subtext and buttons, measuring
          1.4:1 there on a phone. Peak the scrim where the copy sits instead. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-bg/45 via-bg/60 to-bg/75" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[28%] bg-gradient-to-b from-transparent to-bg" />

      <motion.div
        style={{ y: reduce ? 0 : contentY }}
        className="mx-auto flex min-h-[100dvh] max-w-[1100px] flex-col items-center px-5 pt-28 text-center md:pt-32"
      >
        <h1 className="text-balance font-display text-[clamp(2.9rem,8vw,6rem)] leading-[1.02] tracking-tight text-ink [text-shadow:0_2px_30px_rgba(8,8,13,0.35)]">
          <FallWords text={hero.headline} seed={20} />
        </h1>
        <p className="mt-6 max-w-[46ch] text-balance text-base leading-relaxed text-ink/85 md:text-lg [text-shadow:0_1px_16px_rgba(8,8,13,0.4)]">
          <FallWords text={hero.subtext} seed={40} />
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href={hero.primaryButton.href} className={`${PILL} chaos-fall`} style={fallVars(80)}>
            {hero.primaryButton.label}
            <span aria-hidden="true">&rarr;</span>
          </a>
          <a href={hero.secondaryButton.href} className={`${PILL_GHOST} chaos-fall`} style={fallVars(81)}>
            {hero.secondaryButton.label}
          </a>
        </div>
        <BreakIt />
      </motion.div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="px-5 py-28 md:py-40">
      <Reveal className="text-center">
        <p className="font-display text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1.1] tracking-tight text-ink">
          {manifesto[0]}
          <br />
          {manifesto[1]}
        </p>
      </Reveal>
    </section>
  );
}

function ProjectRow({ p, flip }: { p: Project; flip: boolean }) {
  return (
    <Reveal>
      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        <div
          className={`flex flex-col rounded-[20px] border border-line bg-card p-8 md:p-10 ${
            flip ? "xl:order-2" : ""
          }`}
        >
          <ProjectStatus name={p.name} />
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ink-faint">{p.period}</p>
          <h3 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            {p.name}
          </h3>
          <p className="mt-1 text-sm text-ink-dim">{p.tag}</p>
          <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-ink-dim">{p.body}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {p.facets.map((f, i) => (
              <span
                key={f}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  i === 0
                    ? "border-transparent bg-ink text-bg"
                    : "border-line text-ink-dim"
                }`}
              >
                {f}
              </span>
            ))}
          </div>

          <div className="relative mt-7 h-px w-full bg-line">
            <span className="absolute left-0 top-0 h-px w-16 bg-ink" />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={p.demo}
              target="_blank"
              rel="noreferrer"
              className={`${PILL} w-fit !px-5 !py-2.5`}
            >
              Live demo
              <span aria-hidden="true">&rarr;</span>
            </a>
            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className={`${PILL_GHOST} w-fit !px-5 !py-2.5`}
              >
                View on GitHub
              </a>
            )}
          </div>
        </div>

        <div
          className={`relative aspect-[6/5] overflow-hidden rounded-[20px] border border-line xl:aspect-auto xl:min-h-[300px] ${
            flip ? "xl:order-1" : ""
          }`}
        >
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image}
              alt={`${p.name} interface preview`}
              className={`absolute inset-0 h-full w-full object-cover ${FOCUS[p.imageFocus]}`}
              loading="lazy"
            />
          ) : (
            <div aria-hidden="true" className={`absolute inset-0 ${TINTS[p.fallbackTint]}`} />
          )}
        </div>
      </div>
    </Reveal>
  );
}

function Skills() {
  return (
    <section id="skills" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[900px]">
        <Reveal className="text-center">
          <Eyebrow>{skillsHeading.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight tracking-tight text-ink">
            {skillsHeading.headline}
          </h2>
        </Reveal>

        <dl className="mt-14 md:mt-20">
          {skills.map((g, i) => (
            <Reveal
              key={g.label}
              delay={i * 0.04}
              className="grid gap-1.5 border-t border-line py-5 md:grid-cols-[200px_1fr] md:gap-8 md:py-6"
            >
              <dt className="text-xs uppercase tracking-[0.2em] text-ink-faint">{g.label}</dt>
              <dd className="text-sm text-ink-dim md:text-base">{g.items}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="projects" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <Reveal className="text-center">
          <Eyebrow>{projectsHeading.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight tracking-tight text-ink">
            {projectsHeading.headline}
          </h2>
        </Reveal>
        <div className="mt-16 flex flex-col gap-6 md:mt-20">
          {projects.map((p, i) => (
            <ProjectRow key={p.name} p={p} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section id="open-source" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[900px]">
        <Reveal className="text-center">
          <Eyebrow>{openSourceHeading.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight tracking-tight text-ink">
            {openSourceHeading.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-[44ch] text-balance text-sm leading-relaxed text-ink-dim md:text-base">
            {openSourceHeading.subtext}
          </p>
        </Reveal>

        <ul className="mt-14 md:mt-20">
          {openSource.map((c, i) => (
            <li key={c.url} className="border-t border-line py-6 last:border-b">
              <Reveal delay={i * 0.04}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-sm font-medium text-ink">{c.repo}</span>
                  <span className="text-xs text-ink-faint">{c.stars} stars</span>
                  <span
                    className={`ml-auto rounded-full border px-3 py-1 text-xs ${
                      c.status === "Merged"
                        ? "border-transparent bg-ink text-bg"
                        : "border-line text-ink-dim"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="mt-3 break-words font-mono text-xs text-ink-dim md:text-sm">{c.title}</p>
                <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-dim">{c.summary}</p>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 py-1 text-sm text-ink transition-colors hover:text-ink-dim"
                >
                  View pull request <span aria-hidden="true">&rarr;</span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="relative overflow-hidden px-5 py-28 md:py-40">
      <div className="wisp pointer-events-none absolute -left-24 top-1/3 -z-10 h-72 w-72" aria-hidden="true" />
      <div className="mx-auto max-w-[900px] text-center">
        <Reveal>
          <Eyebrow>{metricsSection.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.08] tracking-tight text-ink">
            {metricsSection.headline[0]}
            <br />
            {metricsSection.headline[1]}
          </h2>
          <p className="mx-auto mt-6 max-w-[42ch] text-balance text-sm leading-relaxed text-ink-dim md:text-base">
            {metricsSection.subtext}
          </p>
        </Reveal>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.06}>
              <dt className="font-display text-4xl tracking-tight text-ink md:text-5xl">{m.value}</dt>
              <dd className="mx-auto mt-2 max-w-[18ch] text-xs text-ink-dim md:text-sm">{m.label}</dd>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={0.1}>
          <a href={metricsSection.button.href} className={`${PILL} mt-14`}>
            {metricsSection.button.label}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1000px]">
        <Reveal className="text-center">
          <Eyebrow>{about.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[clamp(2.2rem,4.5vw,3.5rem)] leading-tight tracking-tight text-ink">
            {about.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-[60ch] text-base leading-relaxed text-ink-dim">
            {about.intro}
          </p>
        </Reveal>

        {/* At a glance */}
        <Reveal delay={0.05}>
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 rounded-[20px] border border-line bg-card p-6 md:grid-cols-4 md:p-8">
            {about.quickFacts.map((f) => (
              <div key={f.label}>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">{f.label}</dt>
                <dd className="mt-1.5 text-sm text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Experience. Add another entry in content.ts and a card appears here. */}
        <Reveal delay={0.08} className="mt-6">
          <Eyebrow>Experience</Eyebrow>
          <div className="mt-4 flex flex-col gap-4">
            {experience.map((job) => (
              <div
                key={job.org}
                className="rounded-[20px] border border-line bg-card p-6 md:p-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-2xl text-ink">{job.org}</h3>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">
                    {job.role}, {job.period}
                  </p>
                </div>
                <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink-dim marker:text-ink-faint">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Education + Certifications */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.1} className="rounded-[20px] border border-line bg-card p-6 md:p-8">
            <Eyebrow>Education</Eyebrow>
            <ul className="mt-4 divide-y divide-line">
              {education.map((e) => (
                <li key={e.school} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-sm text-ink">{e.degree}</p>
                  <p className="mt-1 text-sm text-ink-dim">{e.school}</p>
                  <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-ink-faint">{e.meta}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.12} className="rounded-[20px] border border-line bg-card p-6 md:p-8">
            <Eyebrow>Certifications</Eyebrow>
            <ul className="mt-4 divide-y divide-line">
              {certifications.map((c) => (
                <li key={c} className="py-4 text-sm text-ink-dim first:pt-0 last:pb-0">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactCTA() {
  return (
    <section id="contact" className="aurora relative overflow-hidden px-5 pb-32 pt-40 md:pb-48 md:pt-56">
      <div className="mx-auto max-w-[900px] text-center">
        <Reveal>
          <Eyebrow>{contact.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-balance font-display text-[clamp(3rem,9vw,7rem)] leading-[0.98] tracking-tight text-ink [text-shadow:0_2px_40px_rgba(8,8,13,0.4)]">
            {contact.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-[44ch] text-balance text-sm leading-relaxed text-ink-dim md:text-base">
            {contact.subtext}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${profile.email}`} className={PILL}>
              {contact.primaryButton.label}
              <span aria-hidden="true">&rarr;</span>
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className={PILL_GHOST}>
              {contact.secondaryButton.label}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-bg pb-28 pt-16 md:pb-16">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <p className="font-display text-2xl leading-tight text-ink">
            {footer.tagline[0]}
            <br />
            {footer.tagline[1]}
          </p>
          {footer.columns.map((col) => (
            <div key={col.head}>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">{col.head}</p>
              <ul className="mt-4 flex flex-col gap-0.5 text-sm text-ink-dim">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={it.href}
                      target={it.href.startsWith("#") ? undefined : "_blank"}
                      rel={it.href.startsWith("#") ? undefined : "noreferrer"}
                      /* inline-block + padding: as inline text these were 17px
                         tall, under the 24px WCAG 2.2 target minimum, and only
                         passing on the spacing exception. */
                      className="inline-block py-1 transition-colors hover:text-ink"
                    >
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-sm text-ink-faint sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <span className="font-display text-base text-ink-dim">
            {profile.fullName}<sup className="ml-0.5 text-[0.6em] align-super">®</sup>
          </span>
          <a
            href={`mailto:${profile.email}`}
            className="inline-block py-1 transition-colors hover:text-ink"
          >
            {profile.email}
          </a>
          <span className="sm:justify-self-end">{profile.footerNote}</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

function RecruiterView({ onExit }: { onExit: () => void }) {
  return (
    <section aria-label="Recruiter summary" className="px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>{recruiter.eyebrow}</Eyebrow>
            <h1 className="mt-5 text-balance font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-[1.02] tracking-tight text-ink">
              {recruiter.headline}
            </h1>
            <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-ink-dim md:text-lg">{recruiter.line}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {profile.resumeUrl ? (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform active:scale-[0.98]"
                >
                  View resume
                </a>
              ) : null}
              <a href={`mailto:${profile.email}`} className={PILL_GHOST}>
                Email me
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className={PILL_GHOST}>
                LinkedIn
              </a>
            </div>
            <p className="mt-6 text-sm text-ink-faint">{recruiter.stack}</p>
          </div>
          <dl className="self-center">
            {recruiter.numbers.map((n) => (
              <div
                key={n.label}
                className="grid grid-cols-[96px_1fr] items-baseline gap-5 border-t border-line py-5 last:border-b md:grid-cols-[160px_1fr] md:gap-6 md:py-6"
              >
                <dt className="font-display text-5xl leading-none text-ink md:text-6xl">{n.value}</dt>
                <dd className="text-sm leading-relaxed text-ink-dim md:text-base">{n.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <article aria-label={recruiter.featured.label} className="mt-14 rounded-[20px] border border-line bg-card p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">{recruiter.featured.label}</p>
              <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">{recruiter.featured.name}</h2>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-dim md:text-base">{recruiter.featured.pitch}</p>
              <p className="mt-5 text-xs leading-relaxed text-ink-faint">{recruiter.featured.stack}</p>
              <a
                href={recruiter.featured.demo}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform active:scale-[0.98]"
              >
                {recruiter.featured.cta} <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            <ul className="flex flex-col">
              {recruiter.featured.points.map((pt) => (
                <li key={pt} className="border-t border-line py-4 text-sm leading-relaxed text-ink-dim first:border-t-0 first:pt-0 md:text-base">
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {projects.filter((p) => p.name !== recruiter.featured.name).slice(0, recruiter.projectCount).map((p) => (
            <li key={p.name}>
              <a
                href={p.demo}
                target="_blank"
                rel="noreferrer"
                className="flex h-full flex-col gap-1.5 rounded-[20px] border border-line bg-card p-6 transition-colors hover:border-white/30"
              >
                <span className="font-display text-3xl text-ink">{p.name}</span>
                <span className="text-sm text-ink-dim">{p.tag}</span>
                <span className="mt-3 text-sm text-ink">
                  Live demo <span aria-hidden="true">&rarr;</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-ink-faint">
          {recruiter.outro}{" "}
          <button type="button" onClick={onExit} className="text-ink underline underline-offset-4 hover:text-ink-dim">
            {recruiter.outroLink}
          </button>{" "}
          for the full site.
        </p>
      </div>
    </section>
  );
}

export default function Page() {
  const [recruiterOn, setRecruiter] = useRecruiterMode();
  return (
    <>
      <div aria-hidden="true" className="grain-layer" />
      <Nav recruiterOn={recruiterOn} setRecruiter={setRecruiter} />
      <main>
        {recruiterOn ? (
          <RecruiterView onExit={() => setRecruiter(false)} />
        ) : (
          <>
            <Hero />
            <Manifesto />
            <Work />
            <OpenSource />
            <Metrics />
            <Skills />
            <About />
            <ContactCTA />
          </>
        )}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
