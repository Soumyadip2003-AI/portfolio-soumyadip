/* Run with: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { localAnswer, splitSources, withRecovery } from "./resilience.ts";

const known = ["Experience: Euphoria Genx", "Skills: Databases", "Projects: Nova"];

test("takes the sources line off the answer and keeps only real labels", () => {
  const r = splitSources("He built APIs.\nSources: [Experience: Euphoria Genx]; Skills: databases; Made Up", known);
  assert.equal(r.text, "He built APIs.");
  assert.deepEqual(r.sources, ["Experience: Euphoria Genx", "Skills: Databases"]);
});

test("Sources: none means no source, and no line means the model gave none", () => {
  assert.deepEqual(splitSources("I don't have that.\nSources: none", known), { text: "I don't have that.", sources: [] });
  assert.deepEqual(splitSources("Hello there.", known), { text: "Hello there.", sources: null });
});

test("retries only retryable errors, with the given waits, then succeeds", async () => {
  const seen: number[] = [];
  const result = await withRecovery(
    async (n) => {
      if (n < 2) throw new Error("503");
      return "ok";
    },
    { delays: [1, 2], retryable: () => true, onRetry: (n, delay) => seen.push(n, delay) },
  );
  assert.equal(result, "ok");
  assert.deepEqual(seen, [1, 1, 2, 2]);
});

test("gives up after the last delay, and never retries a non-retryable error", async () => {
  let calls = 0;
  await assert.rejects(withRecovery(async () => { calls++; throw new Error("503"); }, { delays: [1, 1], retryable: () => true }));
  assert.equal(calls, 3);
  calls = 0;
  await assert.rejects(withRecovery(async () => { calls++; throw new Error("400"); }, { delays: [1, 1], retryable: () => false }));
  assert.equal(calls, 1);
});

test("the fallback answers from the best matching saved fact, or not at all", () => {
  const facts = [
    { label: "Skills: Databases", text: "PostgreSQL, MongoDB, Redis, Prisma ORM" },
    { label: "Projects: Nova", text: "An autonomous coding agent." },
  ];
  assert.equal(localAnswer("Which databases does he know?", facts)?.source, "Skills: Databases");
  assert.equal(localAnswer("Tell me about Nova", facts)?.source, "Projects: Nova");
  assert.equal(localAnswer("What is the weather?", facts), null);
});
