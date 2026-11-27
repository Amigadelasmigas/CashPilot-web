// Every outside URL the site links to, in one place.
export const GH = "https://github.com/GeiserX";
export const DOCS = "https://geiserx.github.io/CashPilot";
export const SITE = "https://cashpilot.club";
export const CONTACT_EMAIL = "info@cashpilot.club";

export const repo = {
  web: `${GH}/CashPilot`,
  desktop: `${GH}/CashPilot-Desktop`,
  android: `${GH}/CashPilot-android`,
  mcp: `${GH}/cashpilot-mcp`,
  ha: `${GH}/cashpilot-ha`,
  site: `${GH}/cashpilot-web`,
};

export const files = {
  winInstaller: "CashPilot-Desktop-windows-amd64-setup.exe",
  winPortable: "CashPilot-Desktop-windows-amd64.exe",
  mac: "CashPilot-Desktop-darwin-arm64.zip",
  linux: "CashPilot-Desktop-linux-amd64.tar.gz",
  sums: "SHA256SUMS",
  apk: "app-release.apk",
} as const;

/**
 * Download links pinned to the release the page was built from, so the version,
 * sizes and checksums on the page always describe the file the button gives.
 * A `releases/latest/download/...` link would move to a new release the moment
 * it publishes, up to a day before the site rebuilds.
 */
export function downloadsFor(desktopTag: string, androidTag: string) {
  const desktop = (name: string) => `${repo.desktop}/releases/download/${desktopTag}/${name}`;
  return {
    winInstaller: desktop(files.winInstaller),
    winPortable: desktop(files.winPortable),
    mac: desktop(files.mac),
    linux: desktop(files.linux),
    sums: desktop(files.sums),
    apk: `${repo.android}/releases/download/${androidTag}/${files.apk}`,
  };
}

export const docs = {
  home: `${DOCS}/`,
  gettingStarted: `${DOCS}/getting-started/`,
  appStores: `${DOCS}/app-stores/`,
  unraid: `${DOCS}/app-stores/#unraid-community-applications`,
  truenas: `${DOCS}/app-stores/#truenas-scale`,
  casaos: `${DOCS}/app-stores/#casaos`,
  arm: `${DOCS}/arm/`,
  fleet: `${DOCS}/fleet/`,
  guides: `${DOCS}/guides/`,
  guide: (slug: string) => `${DOCS}/guides/${slug}/`,
  ratings: `${DOCS}/ratings/`,
  homeSecurity: `${DOCS}/home-network-security/`,
  comparison: `${DOCS}/comparison/`,
  comparisonOutbound: `${DOCS}/comparison/#side-by-side`,
  forAgents: `${DOCS}/for-ai-agents/`,
};

export const feeds = {
  releases: `${repo.web}/releases.atom`,
};

export const rivals = {
  money4band: "https://github.com/MRColorR/money4band",
  igm: "https://github.com/XternA/income-generator",
  internetIncome: "https://github.com/engageub/InternetIncome",
  cashFactory: "https://github.com/OlivierGaland/CashFactory",
};

export const cloudflarePrivacy = "https://www.cloudflare.com/privacypolicy/";
export const githubPrivacy = "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement";

/** The compose file of a given web release, so the command and the "read it" link match the pinned images. */
export const composeUrl = (tag: string) => `https://raw.githubusercontent.com/GeiserX/CashPilot/${tag}/docker-compose.yml`;
export const composeView = (tag: string) => `${repo.web}/blob/${tag}/docker-compose.yml`;
