// How the site groups the service catalog.
export const CATEGORY_ORDER = ["bandwidth", "depin", "compute", "storage", "mining"] as const;
export type Category = (typeof CATEGORY_ORDER)[number];

export const categoryIcon: Record<string, "network" | "wifi" | "chip" | "disk" | "pickaxe"> = {
  bandwidth: "wifi",
  depin: "network",
  compute: "chip",
  storage: "disk",
  mining: "pickaxe",
};

/** Human size for a byte count, in the page's locale: "10.5 MB". */
export function formatSize(bytes: number, locale: string): string {
  const mb = bytes / 1_000_000;
  return new Intl.NumberFormat(locale, { style: "unit", unit: "megabyte", maximumFractionDigits: mb < 10 ? 1 : 0 }).format(mb);
}

/**
 * The services the home page shows, a few from each group, so the table shows
 * the range beyond bandwidth sharing. Bandwidth follows the catalog's own
 * priority order. For the other groups, which have no priority, these slugs
 * were picked by hand; a slug that leaves the catalog is skipped.
 */
export const FEATURED: Record<Category, { count: number; slugs?: string[] }> = {
  bandwidth: { count: 3 },
  depin: { count: 2, slugs: ["grass", "titan"] },
  compute: { count: 1, slugs: ["vast-ai"] },
  storage: { count: 1, slugs: ["storj"] },
  mining: { count: 1, slugs: ["unmineable"] },
};

/** "v1.7.0" -> "1.7.0" */
export const bareVersion = (tag: string) => tag.replace(/^v/, "");

/** The systems on /download, in tile order. Each has its own page. */
export const OSES = ["windows", "macos", "linux", "android", "docker"] as const;
export type Os = (typeof OSES)[number];
