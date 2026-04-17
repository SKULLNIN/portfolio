/**
 * Copies js-dos browser assets into `public/js-dos/`:
 * - `emulators/` — wasm/js backends for `pathPrefix` in JsDosPlayer
 * - `js-dos.css` — player UI styles (loaded via `<link>`, not bundled: the npm CSS
 *   references `emulators-ui-loader.png`, which is not shipped next to the file in a way
 *   Turbopack can resolve)
 * - `emulators-ui-loader.png` — tiny placeholder so `url(emulators-ui-loader.png)` resolves
 * - `js-dos.js` — runtime bundle (assigns `window.Dos`; not a Turbopack-friendly ES module)
 *
 * Runs on `npm install` via package.json `postinstall`.
 */
import { cpSync, copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "node_modules", "js-dos", "dist");
const emulatorsSrc = join(dist, "emulators");
const cssSrc = join(dist, "js-dos.css");
const jsSrc = join(dist, "js-dos.js");
const destRoot = join(root, "public", "js-dos");
const destEmulators = join(destRoot, "emulators");

/** 1×1 transparent PNG — js-dos CSS references this filename next to the stylesheet. */
const PLACEHOLDER_LOADER_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

if (!existsSync(emulatorsSrc)) {
  console.warn("[copy-js-dos-emulators] skip: missing", emulatorsSrc);
  process.exit(0);
}

if (!existsSync(cssSrc)) {
  console.warn("[copy-js-dos-emulators] skip: missing", cssSrc);
  process.exit(0);
}

if (!existsSync(jsSrc)) {
  console.warn("[copy-js-dos-emulators] skip: missing", jsSrc);
  process.exit(0);
}

mkdirSync(destRoot, { recursive: true });
mkdirSync(destEmulators, { recursive: true });
cpSync(emulatorsSrc, destEmulators, { recursive: true });
copyFileSync(cssSrc, join(destRoot, "js-dos.css"));
copyFileSync(jsSrc, join(destRoot, "js-dos.js"));
writeFileSync(join(destRoot, "emulators-ui-loader.png"), PLACEHOLDER_LOADER_PNG);
console.log("[copy-js-dos-emulators] copied → public/js-dos/ (emulators, js-dos.js, js-dos.css, loader png)");
