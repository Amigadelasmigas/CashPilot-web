// The data every page reads, resolved once per build. Live data from GitHub and
// Docker Hub wins; any part that cannot be fetched comes from snapshot.json, so
// the build never fails offline. CASHPILOT_OFFLINE=1 skips the network.
import snapshot from "./snapshot.json";
import { fetchLive, type SiteData, type Service } from "./fetch";
import { CATEGORY_ORDER } from "../lib/catalog";
import { checkTypedCodes } from "../lib/typed-codes";

export type { SiteData, Service };

let cached: Promise<SiteData> | undefined;

async function resolve(): Promise<SiteData> {
  const snap = snapshot as unknown as SiteData;
  if (process.env.CASHPILOT_OFFLINE === "1") {
    console.info("[data] CASHPILOT_OFFLINE=1: using the snapshot only");
    return snap;
  }
  const live = await fetchLive();
  const used = (Object.keys(snap) as (keyof SiteData)[]).filter((k) => k !== "fetchedAt" && live[k] === undefined);
  if (used.length) {
    // In CI a failed build keeps the last good deploy live, which beats
    // publishing stale numbers under today's date.
    if (process.env.CI) throw new Error(`[data] could not fetch: ${used.join(", ")}. Not deploying snapshot data from CI.`);
    console.warn(`[data] from snapshot: ${used.join(", ")}`);
  } else console.info("[data] all live");
  const data = { ...snap, ...live } as SiteData;
  // Any part from the snapshot keeps the snapshot's date, so the page never
  // shows an old figure under today's date.
  if (used.length) data.fetchedAt = snap.fetchedAt;
  return data;
}

function check(data: SiteData): SiteData {
  const known = new Set<string>(CATEGORY_ORDER);
  const unknown = [...new Set(data.services.filter((s) => !known.has(s.category)).map((s) => `${s.slug} (${s.category})`))];
  if (unknown.length) throw new Error(`[data] unknown catalog categories, add them to CATEGORY_ORDER in src/lib/catalog.ts: ${unknown.join(", ")}`);
  const typed = checkTypedCodes(data.services);
  if (typed.length) throw new Error(`[data] typed codes in src/lib/typed-codes.ts no longer match the catalog: ${typed.join("; ")}`);
  return data;
}

export function getData(): Promise<SiteData> {
  cached ??= resolve().then(check);
  return cached;
}

/** Services the catalog lists as running or in beta, the ones CashPilot supports today. */
export const isLive = (s: Service) => s.status === "active" || s.status === "beta";

/** A signup link that carries a referral code for the project. */
export const isReferral = (s: Service) =>
  Boolean(s.signupUrl && s.code && s.signupUrl.includes(s.code)) || Boolean(s.signupUrl && s.codeEntry);
