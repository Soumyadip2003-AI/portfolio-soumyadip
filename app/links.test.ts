/* Run with: npm test   (node's own runner, no framework, no dependency) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLinks } from "./links.ts";

const hrefs = (s: string) => parseLinks(s).flatMap((p) => (p.kind === "link" ? [p.href] : []));

const RESUME =
  "https://drive.google.com/file/d/1JPq59Y0u8hZgeLR_6jps7_9SrpCvl2Hp/view?usp=sharing";

test("hands back the resume link whole, query string and all", () => {
  assert.deepEqual(hrefs(`You can view his resume here: ${RESUME}`), [RESUME]);
});

test("leaves sentence punctuation out of the href", () => {
  assert.deepEqual(hrefs("See https://a.com/x."), ["https://a.com/x"]);
  assert.deepEqual(hrefs("(see https://a.com/x)"), ["https://a.com/x"]);
  assert.deepEqual(hrefs("https://a.com/x, then"), ["https://a.com/x"]);
  assert.deepEqual(hrefs("Is it https://a.com/x?"), ["https://a.com/x"]);
});

test("finds every link in one answer", () => {
  assert.deepEqual(hrefs("one https://a.com/1 and https://b.com/2."), [
    "https://a.com/1",
    "https://b.com/2",
  ]);
});

test("loses no characters: the pieces rebuild the original", () => {
  for (const s of [
    `Resume: ${RESUME}`,
    "See https://a.com/x. Then https://b.com/y!",
    "no links at all",
    "",
  ]) {
    const rebuilt = parseLinks(s)
      .map((p) => (p.kind === "text" ? p.value : p.href + p.tail))
      .join("");
    assert.equal(rebuilt, s);
  }
});
