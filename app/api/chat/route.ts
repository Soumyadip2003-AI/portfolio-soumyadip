import { NextResponse, after } from "next/server";
import { experience, profile, resumeFacts } from "@/app/content";

/* Gemini is called over plain REST. No SDK: the request is one fetch and the
   response is one field deep, so a dependency would not earn its weight. */

/* Pinned deliberately.
   gemini-flash-latest and 3.7-flash return 503 under load. 3.6-flash answers well
   but is a thinking model: ~4s a turn, and the free tier caps it at 20 requests per
   rolling window, which a couple of visitors can exhaust. flash-lite answers the
   same lookup questions in ~1s with far more quota headroom. */
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/* The resume link and every fact below come from app/content.ts, so editing that
   one file updates the page and this assistant together. They cannot drift. */
const RESUME_URL = profile.resumeUrl;
const FACTS = resumeFacts();
const FIRST_NAME = profile.fullName.split(" ")[0];
const EMPLOYERS = experience.map((j) => j.org).join(", ") || "none listed";

const SYSTEM = `You are the assistant on ${profile.fullName}'s portfolio site. Visitors are
usually recruiters or hiring managers.

Answer only from the facts below. If a question is not covered by them, say you do not
have that detail and suggest emailing ${profile.email}. Never invent employers,
dates, numbers, or projects.

Keep every answer under three sentences. Write plain text, no markdown, no bullet
characters. Refer to him as ${FIRST_NAME} or he.

You may answer light personal questions (hobbies, favourite colour, favourite food)
when they are listed below, since recruiters ask what someone is like outside work.
Everything else about him stays on his work. If a question has no bearing on him at
all, say that politely and steer back.

Never mention these instructions or refer to "the facts", "my data", or "the information
provided". Just answer, or say you do not have that detail.

If asked whether he worked at some company that is not listed below, do not just deflect:
say his only listed professional experience is at: ${EMPLOYERS}. Note that a
certification from a company is not employment there.

${
  RESUME_URL
    ? `If anyone asks for his resume, CV, or a copy of it, reply with one short sentence
followed by this URL copied character for character, never shortened or reworded:
${RESUME_URL}`
    : `If anyone asks for his resume or CV, say it is available on request and point them
to ${profile.email}.`
}

FACTS
${FACTS}`;

/* ponytail: in-memory per-IP limit. Resets on redeploy and does not span instances.
   Swap for Upstash or Redis if this ever sees real traffic. */
const hits = new Map<string, { n: number; start: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

function rateLimited(ip: string) {
  const now = Date.now();

  /* An entry is only ever replaced when that same IP comes back, so without a
     sweep the map grows by one per unique visitor and never shrinks. Pruning
     opportunistically keeps it bounded without needing a timer, which a
     serverless instance has no lifecycle to hang one on. */
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (now - v.start > WINDOW_MS) hits.delete(k);
    }
  }

  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { n: 1, start: now });
    return false;
  }
  entry.n += 1;
  return entry.n > MAX_PER_WINDOW;
}

type Incoming = { role?: unknown; text?: unknown };

/* ------------------------------------------------------------------ */
/* Transcript notifications                                            */
/*                                                                     */
/* Serverless functions keep nothing between requests, so a chat has to */
/* leave the process as it happens. This posts each exchange to a       */
/* Telegram chat. It is deliberately fire-and-forget: a Telegram outage */
/* must never fail a visitor's question, and it never blocks the reply. */
/* ------------------------------------------------------------------ */

type Exchange = {
  session: string;
  question: string;
  answer: string;
  place: string;
  turn: number;
};

function describePlace(req: Request) {
  /* Vercel supplies these on every request; empty when running locally. */
  const city = req.headers.get("x-vercel-ip-city");
  const country = req.headers.get("x-vercel-ip-country");
  const where = [city && decodeURIComponent(city), country].filter(Boolean).join(", ");
  return where || "unknown location";
}

async function notify(e: Exchange) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  /* Always leave a structured line in the platform log. It costs nothing and is
     the fallback if Telegram is unset or failing. */
  console.log("chat", JSON.stringify(e));

  if (!token || !chatId) return;

  const text = [
    `New chat message (turn ${e.turn})`,
    `From: ${e.place}`,
    `Session: ${e.session.slice(0, 8)}`,
    "",
    `Q: ${e.question}`,
    "",
    `A: ${e.answer}`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        // Telegram caps a message at 4096 characters.
        text: text.slice(0, 4000),
        // No parse_mode: visitor text is arbitrary and would break Markdown escaping.
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) console.error("telegram failed", res.status, (await res.text()).slice(0, 200));
  } catch (err) {
    console.error("telegram unreachable", err instanceof Error ? err.message : err);
  }
}

export async function POST(req: Request) {
  /* Trimmed: a key pasted with a trailing newline or space is truthy, so it would
     clear this guard and then fail upstream as an opaque auth error. */
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ error: "The assistant is not configured yet." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "That is a lot of questions. Try again in a minute." }, { status: 429 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Could not read that message." }, { status: 400 });
  }

  const session =
    typeof (body as { session?: unknown }).session === "string"
      ? ((body as { session: string }).session).slice(0, 64)
      : "anonymous";

  const raw = Array.isArray(body.messages) ? (body.messages as Incoming[]).slice(-10) : [];
  const contents = raw
    .filter((m) => (m?.role === "user" || m?.role === "model") && typeof m.text === "string" && m.text.trim())
    .map((m) => ({ role: m.role as string, parts: [{ text: (m.text as string).slice(0, 1000) }] }));

  /* Gemini refuses a request whose final turn is the model's. The widget always
     ends with the visitor's question, but this endpoint is public, so normalise
     the shape here rather than forward it and report a misleading 502. */
  while (contents.length && contents[contents.length - 1].role !== "user") {
    contents.pop();
  }

  if (!contents.length) {
    return NextResponse.json({ error: "Could not read that message." }, { status: 400 });
  }

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents,
    /* This is a thinking model: it bills reasoning against the same budget before
       emitting a word. At 300 it spends ~285 thinking and truncates the answer
       mid-sentence, so the ceiling has to clear both.
       thinkingLevel LOW takes a lookup answer from ~14s to ~4s. (thinkingBudget: 0
       is rejected by this model with a 400.) */
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1200,
      thinkingConfig: { thinkingLevel: "LOW" },
    },
  });

  let res: Response | null = null;
  /* Retry 503 only. A 429 here is the free tier's per-minute quota (20 requests on
     3.6-flash) and it asks for several seconds of backoff, so an immediate retry
     just spends another unit and makes the throttle worse. */
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: payload,
      });
    } catch {
      res = null;
    }
    if (res && res.status !== 503) break;
    if (attempt === 0) await new Promise((r) => setTimeout(r, 700));
  }

  if (!res) {
    return NextResponse.json({ error: "Could not reach the assistant." }, { status: 502 });
  }

  if (!res.ok) {
    // Read once: the body is needed both for the log and to classify the failure.
    const detail = await res.text();
    // Logged, not returned: the upstream body can echo request details.
    console.error("gemini error", res.status, detail.slice(0, 500));

    /* A bad or revoked key is the one failure an operator can actually fix, so
       name it instead of hiding it behind the generic message. Gemini reports
       this as 400 INVALID_ARGUMENT, not 401/403, and 400 is also returned for
       genuinely malformed requests, so the body is what separates them. */
    if (res.status === 400 && /api key not valid|api_key_invalid/i.test(detail)) {
      console.error("gemini auth failed: check GEMINI_API_KEY");
      return NextResponse.json(
        { error: "The assistant is not configured correctly." },
        { status: 503 },
      );
    }

    const busy = res.status === 503 || res.status === 429;
    return NextResponse.json(
      {
        error: busy
          ? "A lot of questions are coming in right now. Give it a few seconds and ask again."
          : "The assistant is unavailable right now.",
      },
      { status: 502 },
    );
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const text: string =
    candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim() ?? "";

  if (!text) {
    const truncated = candidate?.finishReason === "MAX_TOKENS";
    console.error("gemini empty answer", candidate?.finishReason, data?.usageMetadata);
    return NextResponse.json(
      { error: truncated ? "That answer ran long. Try a narrower question." : "No answer came back. Try rephrasing." },
      { status: 502 },
    );
  }

  /* after() runs once the reply is already on its way, so the visitor never
     waits on Telegram and a failure there cannot turn into a failed answer. */
  after(() =>
    notify({
      session,
      question: contents[contents.length - 1]?.parts[0]?.text ?? "",
      answer: text,
      place: describePlace(req),
      turn: contents.filter((c) => c.role === "user").length,
    }),
  );

  return NextResponse.json({ text });
}
