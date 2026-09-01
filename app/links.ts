/* Splitting an assistant answer into text and the URLs inside it.

   This lives apart from the widget only so it can be tested. The assistant hands
   out the resume link, and a recruiter clicking a URL with a stray full stop
   welded onto the end gets a 404 instead of a CV, so the regexes below are worth
   pinning down. See links.test.ts. */

export type Piece =
  | { kind: "text"; value: string }
  | { kind: "link"; href: string; tail: string };

export function parseLinks(text: string): Piece[] {
  return text.split(/(https?:\/\/[^\s]+)/g).flatMap((part): Piece[] => {
    if (!part) return [];
    if (!/^https?:\/\//.test(part)) return [{ kind: "text", value: part }];

    /* A sentence ending "...at <url>." would fold the full stop into the href, so
       hand the trailing punctuation back as text. The first group is lazy, so it
       stops at the earliest point where everything after it is punctuation. */
    const m = part.match(/^(.*?)([.,;:!?)\]]*)$/s);
    return [{ kind: "link", href: m?.[1] ?? part, tail: m?.[2] ?? "" }];
  });
}
