// Review helper: puts screenshot slices side by side. bun scripts/montage.ts out.png a.png b.png ...
import sharp from "sharp";
const [out, ...files] = process.argv.slice(2);
const metas = await Promise.all(files.map((f) => sharp(f).metadata()));
const h = Math.max(...metas.map((m) => m.height!));
const gap = 20;
const w = metas.reduce((a, m) => a + m.width!, 0) + gap * (files.length - 1);
let x = 0;
const comps = files.map((f, i) => {
  const c = { input: f, left: x, top: 0 };
  x += metas[i]!.width! + gap;
  return c;
});
await sharp({ create: { width: w, height: h, channels: 3, background: "#444" } }).composite(comps).png().toFile(out!);
