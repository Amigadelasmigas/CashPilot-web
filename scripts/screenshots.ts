// Builds nothing: run `bun run build` first. Serves dist/, opens every page in
// Chromium with the dark colour scheme at 1440px and 390px, saves full-page
// screenshots to screenshots/, and fails if a page makes a request to another
// host or logs a console error.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { startServer } from "./serve";

const server = startServer(0);
const base = `http://localhost:${server.port}`;
const routes = (process.env.ROUTES ?? "/,/download/,/download/windows/,/download/macos/,/download/linux/,/download/docker/,/download/android/,/referrals/,/privacy/,/disclaimer/,/nope/").split(",");
const widths = [
  { name: "1440", width: 1440, height: 900, mobile: false },
  { name: "390", width: 390, height: 844, mobile: true },
];
mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch();
const problems: string[] = [];
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w.width, height: w.height },
    colorScheme: "dark",
    deviceScaleFactor: w.mobile ? 2 : 1,
    isMobile: w.mobile,
    hasTouch: w.mobile,
    locale: process.env.PW_LOCALE ?? "en-US",
    userAgent: process.env.PW_UA,
  });
  for (const route of routes) {
    const page = await ctx.newPage();
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.host !== new URL(base).host && !u.protocol.startsWith("data")) problems.push(`${w.name} ${route}: third-party request ${r.url()}`);
    });
    page.on("console", (m) => {
      if (m.type() === "error" && !(route === "/nope/" && m.text().includes("404"))) problems.push(`${w.name} ${route}: console ${m.text()}`);
    });
    page.on("pageerror", (e) => problems.push(`${w.name} ${route}: ${e.message}`));
    await page.goto(base + route, { waitUntil: "networkidle" });
    // Load lazy images before the full-page shot.
    await page.evaluate(async () => {
      for (const img of Array.from(document.images)) img.loading = "eager";
      await Promise.all(Array.from(document.images).map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
    });
    const name = (route.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home") + `-${w.name}.png`;
    await page.screenshot({ path: `screenshots/${name}`, fullPage: true });
    console.log("shot", name);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.stop(true);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("no third-party requests, no console errors");
