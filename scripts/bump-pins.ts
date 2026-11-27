// Moves the pinned release tags in src/data/pins.json to each repo's latest
// release, but only after every file the site links for that release answers
// HTTP 200 on its exact URL. Run by .github/workflows/bump-pins.yml, which
// opens a PR when this changes the file.
//
//   bun scripts/bump-pins.ts            check and write pins.json
//   bun scripts/bump-pins.ts --dry-run  check only
//
// Exit 1 when a newer release exists but one of its files is missing: that
// release is not pinned, and the red run says which file failed. A repo whose
// release passes is still bumped.
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { OWNER, REPOS, parseSha256Sums } from "../src/data/fetch";
import { files, repo, composeUrl, composeView } from "../src/lib/links";

const PINS = "src/data/pins.json";
type Pinned = "desktop" | "android" | "web";
const dryRun = process.argv.includes("--dry-run");
const pins = JSON.parse(readFileSync(PINS, "utf8")) as Record<Pinned, string>;

const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "cashpilot-web-bump" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function latestTag(r: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${r}/releases/latest`, { headers, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`${res.status} reading the latest ${r} release`);
  return ((await res.json()) as { tag_name: string }).tag_name;
}

/** The final status after redirects. GitHub release files redirect to their storage host. */
async function status(url: string): Promise<number> {
  for (let i = 1; ; i++) {
    try {
      const init = { headers: { "User-Agent": "cashpilot-web-bump" }, signal: AbortSignal.timeout(30_000) };
      let res = await fetch(url, { ...init, method: "HEAD" });
      // A server that does not take HEAD gets a GET.
      if (res.status === 405) res = await fetch(url, init);
      await res.body?.cancel();
      const code = res.status;
      if (code < 500 || i >= 3) return code;
    } catch (e) {
      if (i >= 3) throw e;
    }
    await new Promise((r) => setTimeout(r, 1000 * i));
  }
}

/** Every URL the site links for this release, plus what the page reads from it. */
async function linkedUrls(key: Pinned, tag: string): Promise<{ urls: string[]; problems: string[] }> {
  const problems: string[] = [];
  if (key === "desktop") {
    const base = `${repo.desktop}/releases/download/${tag}`;
    const names = [files.winInstaller, files.winPortable, files.mac, files.linux];
    const urls = [...names, files.sums].map((n) => `${base}/${n}`);
    // The download page prints each file's checksum from SHA256SUMS.
    const sums = await fetch(`${base}/${files.sums}`, { signal: AbortSignal.timeout(30_000) });
    if (sums.ok) {
      const listed = parseSha256Sums(await sums.text());
      for (const n of names) if (!listed[n]) problems.push(`${files.sums} of ${tag} has no line for ${n}`);
    }
    return { urls, problems };
  }
  if (key === "android") return { urls: [`${repo.android}/releases/download/${tag}/${files.apk}`], problems };
  // web: the compose file the install command downloads, its source view, and
  // the two images it pulls.
  const urls = [composeUrl(tag), composeView(tag)];
  const compose = await fetch(composeUrl(tag), { signal: AbortSignal.timeout(30_000) });
  if (compose.ok) {
    const text = await compose.text();
    for (const name of ["cashpilot", "cashpilot-worker"]) {
      const m = text.match(new RegExp(`image:\\s*drumsergio/${name}:([^\\s"']+)`));
      if (!m) problems.push(`docker-compose.yml of ${tag} names no drumsergio/${name} image`);
      else urls.push(`https://hub.docker.com/v2/repositories/drumsergio/${name}/tags/${m[1]}`);
    }
  }
  return { urls, problems };
}

const lines: string[] = [];
const failed: string[] = [];
let changed = false;
for (const key of ["desktop", "android", "web"] as Pinned[]) {
  const r = REPOS[key];
  const tag = await latestTag(r);
  if (tag === pins[key]) {
    console.log(`${r}: ${tag} is pinned already`);
    continue;
  }
  const { urls, problems } = await linkedUrls(key, tag);
  for (const u of urls) {
    const code = await status(u);
    console.log(`${r} ${tag}: ${code} ${u}`);
    if (code !== 200) problems.push(`${code} ${u}`);
  }
  if (problems.length) {
    failed.push(`${r} ${tag} not pinned:\n${problems.map((p) => `  ${p}`).join("\n")}`);
    continue;
  }
  lines.push(`- ${r}: ${pins[key]} to ${tag}, ${urls.length} links answered 200 (https://github.com/${OWNER}/${r}/releases/tag/${tag})`);
  pins[key] = tag;
  changed = true;
}

if (changed && !dryRun) writeFileSync(PINS, JSON.stringify(pins, null, 2) + "\n");
// The workflow reads these to name the branch and fill the PR.
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\nslug=${pins.desktop}-${pins.android}-${pins.web}\n`);
  writeFileSync("bump-summary.md", lines.join("\n") + "\n");
}
if (lines.length) console.log(lines.join("\n"));
if (failed.length) {
  console.error(failed.join("\n"));
  process.exit(1);
}
