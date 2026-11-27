// Runs axe-core (WCAG 2.2 A and AA rules) on every built page in dark mode.
// Run `bun run build` first. Fails on any violation.
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { startServer } from "./serve";

const server = startServer(0);
const base = `http://localhost:${server.port}`;
const routes = ["/", "/download/", "/download/windows/", "/download/docker/", "/download/android/", "/referrals/", "/privacy/", "/disclaimer/", "/nope/"];
const browser = await chromium.launch();
let total = 0;
for (const width of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: "dark" });
  for (const route of routes) {
    const page = await ctx.newPage();
    await page.goto(base + route, { waitUntil: "networkidle" });
    // Open every <details> so their content is checked too.
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    for (const v of res.violations) {
      total++;
      console.log(`${width} ${route}: ${v.id} (${v.impact}) ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`    ${n.target.join(" ")} ${n.failureSummary?.split("\n")[1] ?? ""}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.stop(true);
console.log(total ? `${total} violation(s)` : "no axe violations");
process.exit(total ? 1 : 0);
