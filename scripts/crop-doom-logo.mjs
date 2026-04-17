/**
 * Tight-crop DOOM wordmark PNG: many exports use an opaque checkerboard instead of alpha.
 * Finds bounding box of "foreground" pixels (not light gray / checker neutrals / transparent).
 */
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPath = join(root, "public", "icons", "hires", "doom.png");

const defaultSrc = join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-guutu-Downloads-xp-portfolio",
  "assets",
  "c__Users_guutu_AppData_Roaming_Cursor_User_workspaceStorage_34a4a5b41df948e0c4a1f9117dfe4822_images_image-2b8c3fa5-6682-411e-8811-b8403d317a68.png",
);

const src = process.argv[2] || defaultSrc;

function isBackground(r, g, b, a) {
  if (a < 28) return true;
  const avg = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  // Flat light grays (checkerboard cells)
  if (spread < 22 && avg > 165) return true;
  // Mid checker neutrals (~128)
  if (spread < 40 && avg > 95 && avg < 200 && Math.abs(r - g) < 35 && Math.abs(g - b) < 35) {
    return true;
  }
  return false;
}

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (!isBackground(r, g, b, a)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX < minX || maxY < minY) {
  console.error("[crop-doom-logo] no foreground pixels found:", src);
  process.exit(1);
}

/** Shave edge columns/rows that are almost entirely background (removes residual checker margin). */
function shaveEdges() {
  const colBgRatio = (x) => {
    let bg = 0;
    for (let y = minY; y <= maxY; y++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (isBackground(r, g, b, a)) bg++;
    }
    return bg / (maxY - minY + 1);
  };
  const rowBgRatio = (y) => {
    let bg = 0;
    for (let x = minX; x <= maxX; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (isBackground(r, g, b, a)) bg++;
    }
    return bg / (maxX - minX + 1);
  };
  const threshold = 0.97;
  while (minX < maxX && colBgRatio(minX) >= threshold) minX++;
  while (maxX > minX && colBgRatio(maxX) >= threshold) maxX--;
  while (minY < maxY && rowBgRatio(minY) >= threshold) minY++;
  while (maxY > minY && rowBgRatio(maxY) >= threshold) maxY--;
}

shaveEdges();

const pad = 2;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);

await sharp(src)
  .extract({
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(outPath);

console.log("[crop-doom-logo] wrote", outPath, `${maxX - minX + 1}×${maxY - minY + 1}`);
