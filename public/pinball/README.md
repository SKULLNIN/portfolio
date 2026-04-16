# 3D Pinball: Space Cadet (browser)

Self-contained static site using the [SpaceCadetPinball](https://github.com/alula/SpaceCadetPinball) Emscripten/WASM build.

## Prerequisites

- Python 3 (for the local server with correct COOP/COEP headers)
- Game data files extracted into `games/pinball/` — see `games/pinball/README.txt`

## Run locally

```bash
cd pinball-site
python serve.py
```

Open **http://localhost:8080** (not `file://`).

## Deploy

Upload this entire `pinball-site` folder to any static host. If the host supports headers, apply the same COOP/COEP values as in `netlify.toml` (required for SharedArrayBuffer).

## Contents

| Path | Description |
|------|-------------|
| `index.html` | Page + Emscripten `Module` config |
| `engine/SpaceCadetPinball.js` | Emscripten loader |
| `engine/SpaceCadetPinball.wasm` | Game engine binary |
| `games/pinball/` | Original Windows assets (`PINBALL.DAT`, WAVs, etc.) — **you must add these** |
| `serve.py` | Local Python server with WASM headers |
| `netlify.toml` | Example headers for Netlify |
