# cashpilot.club

The website of [CashPilot](https://github.com/GeiserX/CashPilot): a landing page, downloads for every system, the referral disclosure, privacy and disclaimer pages. Static, dark only, no cookies, no analytics, and no request to any other host at runtime.

## Build

Needs Bun 1.3 and Node 22.23 or newer.

```sh
bun install
bun run build          # type check, then build to dist/
bun run preview        # serve dist/ the way GitHub Pages does
```

The build reads live data from GitHub and Docker Hub: the service catalog, star counts, Docker pulls, release versions, file sizes and checksums. Set `GITHUB_TOKEN` to avoid the API rate limit. Any part it cannot fetch comes from `src/data/snapshot.json`, so the build also works offline. `CASHPILOT_OFFLINE=1` skips the network. `bun run data:snapshot` refreshes the snapshot.

## Checks

```sh
bun run i18n:check     # missing translation files and keys, placeholder and HTML mismatches
bun run screenshots    # full-page shots at 1440 and 390 px into screenshots/; fails on any third-party request
bun run a11y           # axe-core WCAG 2.2 AA on every page; fails on any violation
```

`screenshots` and `a11y` need a Playwright Chromium (`bunx playwright install chromium`) and a build in `dist/`.

## Languages

Every visible string lives in `src/i18n/<locale>.json`, with the same keys as `en.json`. The 20 locales are listed in `src/i18n/locales.ts`. A locale is built when its file exists, at `/<locale>/` (English at `/`). A key missing from a locale shows in English, and `i18n:check` lists it. Keep `{placeholders}`, HTML tags and link targets exactly as in English: the check fails otherwise.

The language picker remembers the choice in `localStorage` only. The site suggests the visitor's language when the page exists in it, and never redirects.

## Layout

| Path | What |
| --- | --- |
| `src/pages/[...locale]/` | The pages, generated once per locale |
| `src/components/` | Header, footer, download panels, frames, small parts |
| `src/data/` | Build-time data fetcher and the offline snapshot |
| `src/lib/links.ts` | Every outside URL |
| `src/assets/shots/` | Product screenshots, cropped by `scripts/prepare-images.ts` |
| `public/` | `CNAME`, favicon, link preview image (`scripts/make-og.ts`) |

## Deploy

`.github/workflows/pages.yml` builds and deploys to GitHub Pages on every push to `main`, once a day, on demand, and on a `release` repository dispatch. The custom domain is `cashpilot.club` (`public/CNAME`).

## Rules for content

- No earnings figure stated as typical.
- A referral note next to every block of provider links, and every referral link listed on `/referrals/`.
- No personal data about anyone. Credit "CashPilot contributors".
- No trackers, cookies, newsletters or third-party requests.

## Licence

[GPL-3.0-or-later](LICENSE). CashPilot contributors.
