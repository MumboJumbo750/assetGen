# AssetsGen

This repo stores asset request specs (MD), generated assets, and a small Pixi preview app
for quick visual checks.

Quick start
1) Put new asset request files in `requests/`.
2) Generate assets into `assets/` using `ASSET_WORKFLOW.md`.
3) Create an embedding spec in `specs/` for any spritesheets.
4) Add the asset(s) to `preview/data/manifest.json` under a project.
5) Run the preview app:
   - From `preview/`: `python -m http.server 5173`
   - Open `http://localhost:5173` in a browser

Repo layout
- `ASSET_WORKFLOW.md`: workflow + quality bar for asset generation
- `requests/`: incoming asset request MDs
- `requests/REQUEST_TEMPLATE.md`: template for new asset requests
- `assets/`: exported, web-optimized assets
- `specs/`: per-asset metadata and embedding coordinates
- `specs/EMBEDDING_TEMPLATE.md`: template for spritesheet embedding data
- `preview/`: Pixi app to inspect assets
