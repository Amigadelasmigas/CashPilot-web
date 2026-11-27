// The data every page reads, resolved once per build. Live data from GitHub and
// Docker Hub wins; any part that cannot be fetched comes from snapshot.json, so
// the build never fails offline. CASHPILOT_OFFLINE=1 skips the network.
import snapshot from "./snapshot.json";
import { fetchLive, type SiteData, type Service } from "./fetch";

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
  if (used.length) console.warn(`[data] from snapshot: ${used.join(", ")}`);
  else console.info("[data] all live");
  return { ...snap, ...live } as SiteData;
}

export function getData(): Promise<SiteData> {
  cached ??= resolve();
  return cached;
}

/** Services the catalog lists as running or in beta, the ones CashPilot supports today. */
export const isLive = (s: Service) => s.status === "active" || s.status === "beta";

/** A signup link that carries a referral code for the project. */
export const isReferral = (s: Service) =>
  Boolean(s.signupUrl && s.code && s.signupUrl.includes(s.code)) || Boolean(s.signupUrl && s.codeEntry);
