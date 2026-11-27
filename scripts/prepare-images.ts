// One-off: crop the product screenshots that the site shows. The sources are the
// screenshots in the CashPilot, CashPilot-Desktop and CashPilot-android repos.
// Usage: bun scripts/prepare-images.ts <CashPilot> <CashPilot-Desktop> <CashPilot-android>
import sharp from "sharp";

const [web, desktop, android] = process.argv.slice(2);
if (!web || !desktop || !android) {
  console.error("usage: bun scripts/prepare-images.ts <CashPilot> <CashPilot-Desktop> <CashPilot-android>");
  process.exit(2);
}
const out = "src/assets/shots";
const jobs: [string, string, { width: number; height: number } | null][] = [
  [`${web}/docs/images/screenshots/dashboard.png`, "dashboard.png", { width: 2880, height: 1800 }],
  [`${web}/docs/images/screenshots/fleet.png`, "fleet.png", { width: 2880, height: 1800 }],
  [`${web}/docs/images/screenshots/catalog.png`, "catalog.png", { width: 2880, height: 1800 }],
  [`${web}/docs/images/screenshots/payouts.png`, "payouts.png", { width: 2880, height: 1800 }],
  [`${web}/docs/images/screenshots/dashboard-mobile.png`, "dashboard-mobile.png", null],
  [`${desktop}/docs/images/screenshots/02-dashboard.png`, "desktop-dashboard.png", { width: 2880, height: 1800 }],
  [`${android}/app/src/test/screenshots/screens/home_healthy_dark.png`, "android-home.png", null],
];
for (const [src, name, crop] of jobs) {
  let img = sharp(src);
  if (crop) img = img.extract({ left: 0, top: 0, ...crop });
  await img.png({ compressionLevel: 9 }).toFile(`${out}/${name}`);
  console.log("wrote", name);
}
