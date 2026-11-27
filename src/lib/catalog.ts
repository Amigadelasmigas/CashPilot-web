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

/** Human size for a byte count, in the visitor's locale: "10.5 MB". */
export function formatSize(bytes: number, locale: string): string {
  const mb = bytes / 1_000_000;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: mb < 10 ? 1 : 0 }).format(mb)} MB`;
}

/** "v1.7.0" -> "1.7.0" */
export const bareVersion = (tag: string) => tag.replace(/^v/, "");

/** The systems on /download, in tile order. Each has its own page. */
export const OSES = ["windows", "macos", "linux", "android", "docker"] as const;
export type Os = (typeof OSES)[number];
