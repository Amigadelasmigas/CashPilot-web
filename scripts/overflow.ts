// Run `bun run build` first. Opens every page at common phone, tablet and
// desktop widths and fails when any page is wider than the screen, which makes
// it scroll sideways.
import { chromium } from "playwright";
import { startServer } from "./serve";

const server = startServer(0);
const base = `http://localhost:${server.port}`;
const routes = process.env.ROUTES?.split(",") ?? ["/", "/download/", "/download/windows/", "/download/macos/", "/download/linux/", "/download/docker/", "/download/android/", "/referrals/", "/privacy/", "/disclaimer/", "/nope/"];
const widths = [320, 360, 375, 390, 414, 768, 1024, 1440];
const browser = await chromium.launch();
const bad: string[] = [];
for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: "dark", userAgent: process.env.PW_UA });
  for (const route of routes) {
    const page = await ctx.newPage();
    await page.goto(base + route, { waitUntil: "networkidle" });
    const { sw, cw, culprits } = await page.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      const culprits = Array.from(document.querySelectorAll("body *"))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > cw + 1 && !el.closest(".table-wrap, pre, [hidden]");
        })
        .slice(0, 3)
        .map((el) => `${el.tagName.toLowerCase()}.${(el as HTMLElement).className}`.slice(0, 80));
      return { sw: document.documentElement.scrollWidth, cw, culprits };
    });
    if (sw > cw) bad.push(`${width} ${route}: scrollWidth ${sw} > ${cw} ${culprits.join(" | ")}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.stop(true);
console.log(bad.length ? bad.join("\n") : `no sideways overflow at ${widths.join(", ")} px`);
process.exit(bad.length ? 1 : 0);
