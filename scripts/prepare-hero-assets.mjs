import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.join(process.cwd(), "public", "assets");
const outputDir = path.join(sourceDir, "bogor", "hero");

await fs.mkdir(outputDir, { recursive: true });

const facilitySource = path.join(sourceDir, "Facilites_hero.png");
const facilityExports = [
  { name: "facility-medical.png", left: 0, width: 590 },
  { name: "facility-safety.png", left: 570, width: 520 },
  { name: "facility-sport.png", left: 1060, width: 612 },
];

for (const asset of facilityExports) {
  await sharp(facilitySource)
    .extract({ left: asset.left, top: 100, width: Math.min(asset.width, 1672 - asset.left), height: 740 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, asset.name));
}

await sharp(path.join(sourceDir, "Tools_facilites_hero.png"))
  .png({ compressionLevel: 9 })
  .toFile(path.join(outputDir, "ornaments.png"));

const { data, info } = await sharp(path.join(sourceDir, "SIGAP_Mascout_hero.png"))
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
const ch = info.channels;

// Background reference: median of the four corners.
const corner = (x, y) => {
  const i = (y * w + x) * ch;
  return [data[i], data[i + 1], data[i + 2]];
};
const corners = [corner(2, 2), corner(w - 3, 2), corner(2, h - 3), corner(w - 3, h - 3)];
const bgRef = [0, 1, 2].map((c) =>
  corners.map((p) => p[c]).sort((a, b) => a - b)[Math.floor(corners.length / 2)]
);

const dist = (r, g, b) =>
  Math.abs(r - bgRef[0]) + Math.abs(g - bgRef[1]) + Math.abs(b - bgRef[2]);

// Flood fill from every border pixel, traversing only "background-like" pixels.
const visited = new Uint8Array(w * h);
const queue = new Int32Array(w * h);
let head = 0;
let tail = 0;
const push = (idx) => {
  if (!visited[idx]) {
    visited[idx] = 1;
    queue[tail++] = idx;
  }
};
for (let x = 0; x < w; x++) push(x), push((h - 1) * w + x);
for (let y = 0; y < h; y++) push(y * w), push(y * w + (w - 1));

const TOLERANCE = 60; // Manhattant distance allowed for background-like traversal
while (head < tail) {
  const idx = queue[head++];
  const x = idx % w;
  const y = (idx / w) | 0;
  const o = idx * ch;
  if (dist(data[o], data[o + 1], data[o + 2]) > TOLERANCE) continue;
  if (x > 0) push(idx - 1);
  if (x < w - 1) push(idx + 1);
  if (y > 0) push(idx - w);
  if (y < h - 1) push(idx + w);
}

const rgba = Buffer.alloc(w * h * 4);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    const o = idx * ch;
    const t = idx * 4;
    rgba[t] = data[o];
    rgba[t + 1] = data[o + 1];
    rgba[t + 2] = data[o + 2];
    if (visited[idx]) {
      const d = dist(data[o], data[o + 1], data[o + 2]);
      // Feather between hard-background and the traversal edge.
      rgba[t + 3] = Math.max(0, Math.min(255, Math.round(((d - 20) / 40) * 255)));
    } else {
      rgba[t + 3] = 255;
    }
  }
}

await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(outputDir, "mascot.png"));

console.log(`Hero assets prepared in ${outputDir}`);
