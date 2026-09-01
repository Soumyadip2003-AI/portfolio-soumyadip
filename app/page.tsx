"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ChatWidget } from "./chat-widget";
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
  profile,
  projects,
  projectsHeading,
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
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const PILL =
  "glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-ink transition-[transform,background-color] duration-200 hover:bg-white/12 active:scale-[0.98]";

const PILL_GHOST =
  "inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm text-ink/80 transition-colors duration-200 hover:text-ink hover:border-white/45";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-faint">{children}</p>
  );
}


/* ------------------------------------------------------------------ */
/* sections                                                            */
/* ------------------------------------------------------------------ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 80));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-bg/80 backdrop-blur-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-5 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10">
        <a
          href="#top"
          className="whitespace-nowrap font-display text-base text-ink sm:text-lg md:text-xl"
        >
          {profile.fullName}<sup className="ml-0.5 align-super text-[0.6em]">®</sup>
        </a>
        <nav className="hidden items-center gap-8 justify-self-center text-sm text-ink-dim md:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <a href={navButton.href} className={`${PILL} shrink-0 justify-self-end !px-5 !py-2.5`}>
          {navButton.label}
        </a>
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
    if (reduce) videoRef.current?.pause();
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

      {/* Light scrims: a touch of top shade for the nav, and a base fade into the page. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-bg/35 via-transparent to-bg/55" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[28%] bg-gradient-to-b from-transparent to-bg" />

      <motion.div
        style={{ y: reduce ? 0 : contentY }}
        className="mx-auto flex min-h-[100dvh] max-w-[1100px] flex-col items-center px-5 pt-28 text-center md:pt-32"
      >
        <h1 className="font-display text-[clamp(2.9rem,8vw,6rem)] leading-[1.02] tracking-tight text-ink [text-shadow:0_2px_30px_rgba(8,8,13,0.35)]">
          {hero.headline}
        </h1>
        <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-ink/85 md:text-lg [text-shadow:0_1px_16px_rgba(8,8,13,0.4)]">
          {hero.subtext}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href={hero.primaryButton.href} className={PILL}>
            {hero.primaryButton.label}
            <span aria-hidden="true">&rarr;</span>
          </a>
          <a href={hero.secondaryButton.href} className={PILL_GHOST}>
            {hero.secondaryButton.label}
          </a>
        </div>
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
      <div className="grid items-stretch gap-5 md:grid-cols-2">
        <div
          className={`flex flex-col rounded-[20px] border border-line bg-card p-8 md:p-10 ${
            flip ? "md:order-2" : ""
          }`}
        >
          <span className="h-7 w-7 rounded-full border border-line" aria-hidden="true" />
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
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              className={`${PILL_GHOST} w-fit !px-5 !py-2.5`}
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div
          className={`relative min-h-[300px] overflow-hidden rounded-[20px] border border-line ${
            flip ? "md:order-1" : ""
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
          <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight tracking-tight text-ink">
            {skillsHeading.headline}
          </h2>
        </Reveal>

        <dl className="mt-14 md:mt-20">
          {skills.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.04}>
              <div className="grid gap-1.5 border-t border-line py-5 md:grid-cols-[200px_1fr] md:gap-8 md:py-6">
                <dt className="text-xs uppercase tracking-[0.2em] text-ink-faint">{g.label}</dt>
                <dd className="text-sm text-ink-dim md:text-base">{g.items}</dd>
              </div>
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
          <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] leading-tight tracking-tight text-ink">
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

function Metrics() {
  return (
    <section className="relative overflow-hidden px-5 py-28 md:py-40">
      <div className="wisp pointer-events-none absolute -left-24 top-1/3 -z-10 h-72 w-72" aria-hidden="true" />
      <div className="mx-auto max-w-[900px] text-center">
        <Reveal>
          <Eyebrow>{metricsSection.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.08] tracking-tight text-ink">
            {metricsSection.headline[0]}
            <br />
            {metricsSection.headline[1]}
          </h2>
          <p className="mx-auto mt-6 max-w-[42ch] text-sm leading-relaxed text-ink-dim md:text-base">
            {metricsSection.subtext}
          </p>
        </Reveal>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.06}>
              <div>
                <dt className="font-display text-4xl tracking-tight text-ink md:text-5xl">{m.value}</dt>
                <dd className="mx-auto mt-2 max-w-[18ch] text-xs text-ink-dim md:text-sm">{m.label}</dd>
              </div>
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
          <h2 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] leading-tight tracking-tight text-ink">
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
          <h2 className="mt-5 font-display text-[clamp(3rem,9vw,7rem)] leading-[0.98] tracking-tight text-ink [text-shadow:0_2px_40px_rgba(8,8,13,0.4)]">
            {contact.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-[44ch] text-sm leading-relaxed text-ink-dim md:text-base">
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
    <footer className="border-t border-line bg-bg px-5 py-16 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <p className="font-display text-2xl leading-tight text-ink">
            {footer.tagline[0]}
            <br />
            {footer.tagline[1]}
          </p>
          {footer.columns.map((col) => (
            <div key={col.head}>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">{col.head}</p>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-dim">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={it.href}
                      target={it.href.startsWith("#") ? undefined : "_blank"}
                      rel={it.href.startsWith("#") ? undefined : "noreferrer"}
                      className="transition-colors hover:text-ink"
                    >
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-base text-ink-dim">
            {profile.fullName}<sup className="ml-0.5 text-[0.6em] align-super">®</sup>
          </span>
          <a href={`mailto:${profile.email}`} className="transition-colors hover:text-ink">
            {profile.email}
          </a>
          <span>{profile.footerNote}</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <>
      <div aria-hidden="true" className="grain-layer" />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Work />
        <Metrics />
        <Skills />
        <About />
        <ContactCTA />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
