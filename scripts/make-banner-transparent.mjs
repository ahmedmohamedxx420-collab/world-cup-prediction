// One-off: the Sudanship banner shipped as RGB (no alpha) with a baked-in
// light-gray "transparency" checkerboard painted as real pixels. That reads as
// an ugly light box around the player on dark surfaces. This keys out the
// light, near-grayscale background to alpha=0 and re-exports a true RGBA PNG.
//
// Run once:  node scripts/make-banner-transparent.mjs
import { readFile, writeFile, copyFile, access } from "node:fs/promises";
import sharp from "sharp";

const SRC = "public/sudanship-banner.png";
const BACKUP = "public/sudanship-banner.rgb-backup.png";

// Background = light AND near-grayscale (white + ~#ccc checker cells).
const LIGHT_MIN = 150; // every channel above this
const GRAY_SPREAD = 24; // max-min channel difference below this

async function main() {
  // Back up the original once (don't clobber an existing backup).
  try {
    await access(BACKUP);
  } catch {
    await copyFile(SRC, BACKUP);
    console.log(`backed up original -> ${BACKUP}`);
  }

  const input = await readFile(SRC);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info; // channels === 4 after ensureAlpha
  let cleared = 0;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    if (min > LIGHT_MIN && max - min < GRAY_SPREAD) {
      data[i + 3] = 0; // transparent
      cleared++;
    }
  }

  const out = await sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();
  await writeFile(SRC, out);

  const pct = ((cleared / (width * height)) * 100).toFixed(1);
  console.log(`cleared ${cleared} px (${pct}%) -> ${SRC} (${width}x${height} RGBA)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
