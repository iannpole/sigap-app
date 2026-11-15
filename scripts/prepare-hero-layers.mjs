import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Interim parallax layers generated from the flattened Background_hero.png.
// These exist so the hero renders and parallax is testable before the
// hand-made transparent layers are provided. Replace back.png / mid.png /
// front.png with the final aligned transparent layers (same canvas size).
// Split points tuned to the 1672x941 composition:
//   back  : sky + Mount Salak / Mount Gede + distant treeline   (0..445)
//   mid   : Istana Bogor + Kebun Raya + Tugu Kujang             (400..725)
//   front : street + angkot + warung + wet pavement             (690..941)

const src = path.join(process.cwd(), "public", "assets", "Background_hero.png");
const outDir = path.join(process.cwd(), "public", "assets", "bogor", "hero");

const W = 1672;
const H = 941;
const FEATHER = 50;

const { data, info } = await sharp(src)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const ch = info.channels;

function readRow(y, out, outOffset) {
  for (let x = 0; x < W; x++) {
    const si = (y * W + x) * ch;
    const di = outOffset + x * 4;
    out[di] = data[si];
    out[di + 1] = data[si + 1];
    out[di + 2] = data[si + 2];
    out[di + 3] = 255;
  }
}

async function makeLayer(name, top, bottom, featherTop) {
  const buf = Buffer.alloc(W * H * 4); // transparent
  const rows = bottom - top;
  for (let y = 0; y < rows; y++) {
    const alpha = featherTop && y < FEATHER ? Math.round((255 * y) / FEATHER) : 255;
    readRow(top + y, buf, y * W * 4);
    for (let x = 0; x < W; x++) buf[(y * W + x) * 4 + 3] = alpha;
  }
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, name));
  console.log("wrote", name, `(${top}..${bottom})`);
}

await fs.mkdir(outDir, { recursive: true });
await makeLayer("back.png", 0, 445, false);
await makeLayer("mid.png", 400, 725, true);
await makeLayer("front.png", 690, H, true);
console.log("Interim parallax layers prepared (replace with final transparent layers).");
