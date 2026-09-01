# portfolio-soumyadip

Personal portfolio for Soumyadip Sarkar, with an AI assistant that answers
recruiter questions from a single source of truth.

Next.js 15 (App Router), React 19, Tailwind v4, Motion, and the Gemini API.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your Gemini key
npm run dev                  # http://localhost:3000
```

## Editing the content

**Everything you can read on the site lives in [`app/content.ts`](app/content.ts).**
Every sentence, link, project card, and number. The page and the chatbot both
read from that one file, so they cannot fall out of sync.

- **Add a project** — copy any block inside `projects`, paste it after the last
  one, edit the values. A new card appears and the assistant learns about it.
- **Add an image** — drop the file in `public/`, then reference it as
  `"/name.png"`. Set `image: null` for a gradient instead.
- **Hiring answers** — section 9b holds availability, notice period, relocation,
  and salary. Blank fields make the assistant defer to email rather than guess.

## The assistant

A floating widget answers questions about the resume, grounded in `content.ts`.

- The API key stays server-side in `app/api/chat/route.ts`; the browser never
  sees it.
- The assistant is instructed to answer only from the supplied facts and to
  point at the contact email for anything else, so it declines to invent
  employers, dates, or salary figures.
- Guardrails: 12 requests/min per IP, 10-message history cap, 1000-char
  messages, retry on upstream 503 only.

Model is `gemini-3.5-flash-lite` by default. Override with `GEMINI_MODEL`.

## Layout

| Path | What |
|---|---|
| `app/content.ts` | all site content, the only file you normally edit |
| `app/page.tsx` | section components, no content |
| `app/chat-widget.tsx` | the assistant UI |
| `app/api/chat/route.ts` | Gemini proxy, prompt, rate limiting |
| `app/globals.css` | theme tokens, gradients, grain |
| `public/` | hero video and project screenshots |

## Deploying

Set `GEMINI_API_KEY` in your host's environment settings. Never commit it:
`.env*` is gitignored.
