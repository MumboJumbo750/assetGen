# Asset Workflow and Quality Bar

This repo expects asset requests as MD files and produces web-optimized assets with
consistent style and reliable metadata.

## Workflow (end to end)
1) Read request MD in `requests/`.
   - Extract target sizes, formats, style notes, and deliverables.
   - Identify any character continuity requirements (same proportions, colors, and
     silhouette across all sheets).
2) Establish a style lock.
   - Create or reference a palette, line weight, shading style, and lighting direction.
   - Keep the same anchor references for all assets in the request set.
3) Produce assets.
   - Export to `assets/` using the naming rules below.
   - If the request MD defines a naming scheme or folder structure, that overrides
     the defaults here.
   - Keep alignment consistent across sheets (baseline, pivot, scale).
4) Optimize for web.
   - PNG for transparency; WebP for static assets without alpha.
   - Trim empty pixels when allowed; keep a safe padding for animation.
   - Run compression (pngquant/oxipng/cwebp or equivalent).
   - Video clips: H.264 MP4 (primary), short duration, include poster frame PNG.
5) Document embedding data.
   - For every spritesheet, create an MD spec in `specs/` using
     `specs/EMBEDDING_TEMPLATE.md`.
   - Include frame coordinates, sizes, and total frame counts.
   - If the request calls for a single-sheet character turnaround, add a JSON
     layout descriptor in `specs/` with view coordinates.
6) Preview and verify.
   - Add assets to `preview/data/manifest.json`.
   - Open `preview/` in a local server and verify alignment and style consistency.

## Naming and folders
- Use kebab-case.
- Example image: `assets/characters/hero-knight.png`
- Example spritesheet image: `assets/sprites/hero-knight-idle.png`
- Example spritesheet data: `assets/sprites/hero-knight-idle.json`
- Example spec: `specs/hero-knight-idle.md`
- If the request MD specifies folders or naming, mirror that structure exactly.
- For multi-project work, keep project roots separated (e.g. `assets/{project}/...`).

## Web optimization checklist
- Use sRGB color profile.
- Keep file size minimal for the target resolution.
- Avoid unnecessary alpha where not needed.
- Keep export sizes exact; do not resize in browser.
- Prefer power-of-two texture sizes when performance is critical.

## Character and style consistency
- Keep proportions identical across all sheets for the same character.
- Use the same palette, outline thickness, and shading across all assets.
- Keep anchor points consistent (feet on baseline, same eye line, etc.).
- If the request includes a style reference, treat it as binding.

## Spritesheet requirements
- Each sheet must have a matching MD spec with:
  - Total frame count
  - Frame size
  - Frame coordinates (x, y, w, h)
  - Pivot or anchor per frame (if needed)
  - Animation grouping (idle, walk, attack, etc.)

## Definition of done
- Assets match request specs.
- Style lock is consistent across all assets.
- Files are web optimized and correctly named.
- Embedding/spec MD exists for spritesheets.
- Preview app displays assets without errors.

## Automation loop (validator → ComfyUI → assets)

This repo includes a validator report mode and a small ComfyUI driver script so you
can iterate quickly:

1) Start ComfyUI
    - Option A (in-repo, recommended):
       - `powershell -ExecutionPolicy Bypass -File scripts/comfyui/setup-comfyui-local.ps1 -Python "py -3.11"`
       - `powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-comfyui-local.ps1`
    - Option B (external install under `C:\projects\imageai`):
       - `powershell -ExecutionPolicy Bypass -File C:\projects\imageai\run-comfyui.ps1`
   - Default URL: `http://127.0.0.1:8188`
   - Note: ComfyUI needs at least one model installed (e.g. a checkpoint under
     `ComfyUI/models/checkpoints/` or a Diffusers model under `ComfyUI/models/diffusers/`).

2) Export a workflow JSON from ComfyUI
   - In the ComfyUI UI: save/export the workflow in “API format”.
   - Keep the file somewhere stable (recommended: `scripts/comfyui/workflows/`).
   - The workflow must include a text-to-image path and a `SaveImage` output.

3) Generate a machine-readable “what’s missing” report
   - Use a stable Python (recommended: 3.11). On some Windows setups `py -3` may point to a newer Python that lacks wheels for common packages.
   - `py -3.11 scripts/validate-assets.py --root assets/zelos --report json --report-path build/zelos-report.json`
   - Add `--include-planned` if you also want planned assets included.

4) Drive ComfyUI to generate missing assets
   - Dry run (shows what will be generated):
      - `py -3.11 scripts/comfyui/generate-assets.py --report build/zelos-report.json --dry-run --limit 10`
   - Generate a subset (example: only planets):
      - `py -3.11 scripts/comfyui/generate-assets.py --report build/zelos-report.json --only "^sprites/planets/" --limit 20`

5) Re-validate and preview
   - `py -3.11 scripts/validate-assets.py --root assets/zelos --check-size`
   - `cd preview; py -3.11 -m http.server 5173`

Notes
- The ComfyUI driver currently has prompt mappings for Astro-Duck base/views/sheets,
  expressions, outfit overlays, planets, and satellites. Unknown paths are skipped.
- For prompt wording, see `specs/mage/zelos-mage-prompts.md`.
