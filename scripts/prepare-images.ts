// One-off: crop the product screenshots that the site shows. The sources are the
// screenshots in the CashPilot, CashPilot-Desktop and CashPilot-android repos.
// Usage: bun scripts/prepare-images.ts <CashPilot> <CashPilot-Desktop> <CashPilot-android>
//
// Two kinds of output in src/assets/shots/:
// - "<name>.png": the whole first screen (2880x1800), linked from each crop.
// - "<name>-crop.png": the part of the screen a visitor needs to read, at 2x.
//   Crops stay about 1200 to 1500 px wide, so the text is still readable when
//   the page shows them at 600 px or less.
import sharp from "sharp";

const [web, desktop, android] = process.argv.slice(2);
if (!web || !desktop || !android) {
  console.error("usage: bun scripts/prepare-images.ts <CashPilot> <CashPilot-Desktop> <CashPilot-android>");
  process.exit(2);
}
const out = "src/assets/shots";
const shots = `${web}/docs/images/screenshots`;
type Box = { left: number; top: number; width: number; height: number };
const screen: Box = { left: 0, top: 0, width: 2880, height: 1800 };

const crops: [string, string, Box | null][] = [
  // Whole screens, the targets of the crop links.
  [`${shots}/fleet.png`, "fleet.png", screen],
  [`${shots}/catalog.png`, "catalog.png", screen],
  [`${shots}/payouts.png`, "payouts.png", screen],
  [`${desktop}/docs/images/screenshots/02-dashboard.png`, "desktop-dashboard.png", screen],
  [`${android}/app/src/test/screenshots/screens/home_healthy_dark.png`, "android-home.png", null],
  // Crops for the tour.
  [`${shots}/fleet.png`, "fleet-crop.png", { left: 29, top: 497, width: 1075, height: 753 }],
  [`${shots}/catalog.png`, "catalog-crop.png", { left: 29, top: 202, width: 1411, height: 857 }],
  [`${shots}/payouts.png`, "payouts-crop.png", { left: 43, top: 666, width: 1498, height: 530 }],
  [`${desktop}/docs/images/screenshots/02-dashboard.png`, "desktop-crop.png", { left: 0, top: 0, width: 1555, height: 533 }],
  [`${android}/app/src/test/screenshots/screens/home_healthy_dark.png`, "android-crop.png", { left: 0, top: 0, width: 822, height: 1345 }],
  // The phone hero: the balance cards, without the "Needs attention" list.
  [`${shots}/dashboard-mobile.png`, "hero-mobile.png", { left: 0, top: 0, width: 780, height: 765 }],
];
for (const [src, name, box] of crops) {
  let img = sharp(src);
  if (box) img = img.extract(box);
  await img.png({ compressionLevel: 9 }).toFile(`${out}/${name}`);
  console.log("wrote", name);
}

// The desktop hero: the top of the dashboard (balance, today, this month) joined
// to the placement grid and the "Earned per day" chart. The "Needs attention"
// list between them is left out: a first visit should see the product working.
// The tour and the docs still show how CashPilot reports problems.
const top: Box = { left: 0, top: 0, width: 2880, height: 482 };
const bottom: Box = { left: 0, top: 1037, width: 2880, height: 653 };
const [a, b] = await Promise.all([
  sharp(`${shots}/dashboard.png`).extract(top).png().toBuffer(),
  sharp(`${shots}/dashboard.png`).extract(bottom).png().toBuffer(),
]);
await sharp({ create: { width: 2880, height: top.height + bottom.height, channels: 4, background: "#000" } })
  .composite([
    { input: a, top: 0, left: 0 },
    { input: b, top: top.height, left: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(`${out}/hero.png`);
console.log("wrote hero.png");
