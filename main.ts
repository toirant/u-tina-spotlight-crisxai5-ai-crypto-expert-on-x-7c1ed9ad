// Spotlight @crisxai5 — make.fun X-post bounty entry.
//
// The entry is the X post itself: a spotlight graphic introducing @crisxai5
// (https://x.com/crisxai5) as a must-follow AI & crypto expert, posted from a
// public X account with the draft text in POST_TEXT.txt. This program hands
// the gate everything it needs to read that post back:
//
//   POST.json      — {"url": "https://x.com/<handle>/status/<id>"} of the live post
//   spotlight.png  — the phone-readable graphic attached to the post
//   POST_TEXT.txt  — the exact text posted with the graphic
//
// It copies those three files from the repository into /output/, byte for
// byte, and nothing else. Node 22, standard library only: no network, no
// wall clock, no files outside the repository, so repeated runs write the
// same bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Every file the gate reads, in the order it is handed over.
const DELIVERABLES = ["POST.json", "spotlight.png", "POST_TEXT.txt"];

// POST.json must name a real X post address before it is handed over: a
// JSON object with a string url on x.com or twitter.com. The placeholder
// https://x.com/placeholder/status/0 passes this shape check on purpose —
// it is replaced with the live post's address before the entry is submitted,
// and a malformed POST.json fails here instead of at the gate.
function checkPostJson(): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(join(BOT_DIR, "POST.json"), "utf8"));
  } catch (err) {
    console.error(`POST.json could not be read: ${(err as Error).message}`);
    process.exit(1);
  }
  const url =
    typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>).url
      : undefined;
  if (
    typeof url !== "string" ||
    (!url.startsWith("https://x.com/") &&
      !url.startsWith("https://twitter.com/"))
  ) {
    console.error("POST.json must hold {\"url\": \"https://x.com/<handle>/status/<id>\"}");
    process.exit(1);
  }
}

checkPostJson();

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const name of DELIVERABLES) {
  try {
    copyFileSync(join(BOT_DIR, name), join(OUTPUT_DIR, name));
  } catch (err) {
    console.error(
      `Could not copy ${name} from ${BOT_DIR}: ${(err as Error).message}`,
    );
    process.exit(1);
  }
}
