// Cuts a tall screenshot into viewport-sized slices for review: bun scripts/slice.ts <png> [sliceHeight]
import sharp from "sharp";
const [file, h = "1400"] = process.argv.slice(2);
const img = sharp(file!);
const { width, height } = await img.metadata();
const step = Number(h);
for (let y = 0, i = 0; y < height!; y += step, i++) {
  const out = file!.replace(/\.png$/, `.part${i}.png`);
  await sharp(file!).extract({ left: 0, top: y, width: width!, height: Math.min(step, height! - y) }).toFile(out);
  console.log(out);
}
