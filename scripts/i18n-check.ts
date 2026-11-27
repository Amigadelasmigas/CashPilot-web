// Compares every locale file with src/i18n/en.json.
//
// Lists, per locale: a missing file, missing keys (the site shows English for
// them), keys that English does not have, and strings whose {placeholders} or
// HTML tags differ from English. Missing files and keys are reported but do
// not fail, because the build falls back to English. Unknown keys, placeholder
// and tag mismatches fail (exit 1). With --strict, missing ones fail too.
import { existsSync, readFileSync } from "node:fs";
import { LOCALES } from "../src/i18n/locales";

const strict = process.argv.includes("--strict");
const dir = new URL("../src/i18n/", import.meta.url).pathname;

type Flat = Map<string, string>;
function flatten(obj: unknown, prefix = "", out: Flat = new Map()): Flat {
  if (typeof obj === "string") out.set(prefix, obj);
  else if (obj && typeof obj === "object" && !Array.isArray(obj))
    for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  else throw new Error(`${prefix}: only strings and objects are allowed, found ${JSON.stringify(obj)}`);
  return out;
}
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
const tags = (s: string) => [...s.matchAll(/<\/?([a-z]+)[^>]*>/gi)].map((m) => m[0].startsWith("</") ? `/${m[1]}` : m[1]).sort().join(",");
const hrefs = (s: string) => [...s.matchAll(/href="([^"]*)"/g)].map((m) => m[1]).sort().join(",");

const en = flatten(JSON.parse(readFileSync(`${dir}en.json`, "utf8")));
let errors = 0;
let gaps = 0;
const summary: string[] = [];

for (const loc of LOCALES) {
  if (loc.code === "en") continue;
  const file = `${dir}${loc.code}.json`;
  if (!existsSync(file)) {
    gaps++;
    summary.push(`${loc.code.padEnd(6)} missing file (${en.size} keys fall back to English)`);
    continue;
  }
  let dict: Flat;
  try {
    dict = flatten(JSON.parse(readFileSync(file, "utf8")));
  } catch (e) {
    errors++;
    summary.push(`${loc.code.padEnd(6)} ERROR ${(e as Error).message}`);
    continue;
  }
  const missing = [...en.keys()].filter((k) => !dict.has(k));
  const extra = [...dict.keys()].filter((k) => !en.has(k));
  const bad: string[] = [];
  for (const [k, v] of dict) {
    const ref = en.get(k);
    if (ref === undefined) continue;
    if (placeholders(v) !== placeholders(ref)) bad.push(`${k}: placeholders {${placeholders(v)}} vs English {${placeholders(ref)}}`);
    if (tags(v) !== tags(ref)) bad.push(`${k}: HTML tags [${tags(v)}] vs English [${tags(ref)}]`);
    if (hrefs(v) !== hrefs(ref)) bad.push(`${k}: link targets differ from English`);
  }
  gaps += missing.length;
  errors += extra.length + bad.length;
  summary.push(`${loc.code.padEnd(6)} ${dict.size - extra.length}/${en.size} keys, ${missing.length} missing, ${extra.length} unknown, ${bad.length} mismatched`);
  for (const k of missing) summary.push(`         missing  ${k}`);
  for (const k of extra) summary.push(`         unknown  ${k}`);
  for (const b of bad) summary.push(`         mismatch ${b}`);
}

console.log(`en.json: ${en.size} keys\n`);
console.log(summary.join("\n"));
console.log(`\n${errors} error(s), ${gaps} missing file(s) or key(s)${strict ? " (strict)" : ""}`);
process.exit(errors > 0 || (strict && gaps > 0) ? 1 : 0);
