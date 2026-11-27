// One-off: builds public/og.png (1200x630, the link preview image) and
// public/apple-touch-icon.png from the logo and the dashboard screenshot.
// Run again after a new dashboard screenshot: bun scripts/make-og.ts
import sharp from "sharp";

const W = 1200;
const H = 630;
const mark = await Bun.file("src/assets/mark.svg").text();
const icon = await Bun.file("public/favicon.svg").text();

const shot = await sharp("src/assets/shots/dashboard.png")
  .extract({ left: 0, top: 0, width: 2880, height: 1500 })
  .resize(760)
  .png()
  .toBuffer();
const shotMeta = await sharp(shot).metadata();
const rounded = await sharp(shot)
  .composite([
    {
      input: Buffer.from(`<svg width="${shotMeta.width}" height="${shotMeta.height}"><rect width="100%" height="100%" rx="14" ry="14"/></svg>`),
      blend: "dest-in",
    },
  ])
  .png()
  .toBuffer();

const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g1" cx="78%" cy="30%" r="55%"><stop offset="0" stop-color="#fb7185" stop-opacity="0.28"/><stop offset="1" stop-color="#fb7185" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="95%" cy="85%" r="40%"><stop offset="0" stop-color="#ff9800" stop-opacity="0.16"/><stop offset="1" stop-color="#ff9800" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#07070c"/>
  <rect width="100%" height="100%" fill="url(#g1)"/>
  <rect width="100%" height="100%" fill="url(#g2)"/>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="#ededf4">
    <text x="150" y="118" font-size="40" font-weight="700" letter-spacing="-1">CashPilot</text>
    <text x="72" y="236" font-size="50" font-weight="700" letter-spacing="-1.5">Put your idle</text>
    <text x="72" y="296" font-size="50" font-weight="700" letter-spacing="-1.5">hardware to work.</text>
    <text x="72" y="356" font-size="50" font-weight="700" letter-spacing="-1.5">See every payout</text>
    <text x="72" y="416" font-size="50" font-weight="700" letter-spacing="-1.5">in one dashboard.</text>
    <text x="72" y="500" font-size="24" fill="#b0aec3">Free and open source, GPL-3.0</text>
    <text x="72" y="540" font-size="24" fill="#fb7185">cashpilot.club</text>
  </g>
</svg>`);

const markPng = await sharp(Buffer.from(mark)).resize(60, 60).png().toBuffer();

await sharp(bg)
  .composite([
    { input: markPng, left: 72, top: 72 },
    { input: rounded, left: 560, top: 120 },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/og.png");

await sharp(Buffer.from(icon)).resize(180, 180).png().toFile("public/apple-touch-icon.png");
console.log("wrote public/og.png and public/apple-touch-icon.png");
