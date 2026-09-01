# portfolio-soumyadip

Personal portfolio site for Soumyadip Sarkar. Next.js 15 (App Router), React 19,
Tailwind v4, with scroll animation from `motion` and `gsap`.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Layout

- `app/page.tsx` — the entire page. All content (projects, principles, posts,
  stats, socials, contact email) lives in the `const` arrays at the top.
- `app/layout.tsx` — fonts and metadata.
- `app/globals.css` — theme tokens and animation classes.
- `components/ui/blackhole-hero-section.tsx` — WebGL hero background.

## Before launch

Placeholders to replace, all in `app/page.tsx`:

- `CONTACT_EMAIL` — currently `hello@soumyadip.dev`
- `SOCIALS` hrefs — currently point at bare `github.com` / `linkedin.com` / `x.com`
- `STATS` numbers — sample figures
- `PROJECTS` / `POSTS` / `Quote` — sample content and `picsum.photos` images

Images use `next/image` with optimization off (`next.config.ts`); swap in real
assets and drop `unoptimized` if you host them yourself.
