# Juggernaut XL (SDXL) Prompting Guide (AssetGen)

This is a practical prompting guide for **Juggernaut XL (SDXL checkpoint)** when generating Zelos assets via this repo’s ComfyUI automation.

Reference model page (for screenshots + author notes):
- https://civitai.com/models/133005/juggernaut-xl?modelVersionId=1759168

## What we’re using
- Checkpoint: `juggernautXL_ragnarokBy.safetensors`
- Workflow JSON (tracked in repo): `scripts/comfyui/workflows/assetgen_sdxl_api.json`
- Generator: `scripts/comfyui/generate-assets.py`

Related prompt pack (path-based recipes matching this repo’s specs):
- `specs/mage/zelos-juggernaut-prompts.md`

The generator overwrites:
- Positive/negative prompt text (SDXL `text_g`/`text_l`)
- Width/height (and SDXL `target_width`/`target_height`)
- Seed (optional)

## Core prompt principles (Juggernaut XL)
Juggernaut XL generally responds well to:
- Clear **subject-first** prompts
- A short **style tail** (don’t overload with conflicting styles)
- Specific **lighting** and **material** cues
- Negative prompts focused on “AI failure modes” (blur, text, watermark, messy anatomy)

For AssetGen, consistency matters more than “one perfect image”. Keep templates stable.

## Recommended starting settings (GTX 1060 6GB friendly)
These are safe starting points; adjust after you see a few outputs.

- **Sampler**: `euler` or `dpmpp_2m` (if available in your ComfyUI)
- **Scheduler**: `karras`
- **Steps**: 24–32
- **CFG**: 5–7
- **Resolution**:
  - If you hit VRAM issues, render at max-dimension 768 and upscale (use generator `--fit-vram --max-render-dim 768`).

Notes:
- If images look “overcooked” or noisy: reduce steps or CFG.
- If images ignore your subject details: increase steps slightly or add clearer tokens (“front view”, “clean lineart”, etc.).

## Prompt template (recommended)
Use this structure:

1) **Subject block** (what it is)
2) **Composition block** (camera/view)
3) **Style block** (our art direction)
4) **Constraints** (transparent BG, centered, no text)

Example template:

- **Positive**:
  - `<SUBJECT>, <VIEW>, <COMPOSITION>, clean cartoon illustration, crisp lineart, simple shading, vibrant but controlled palette, studio lighting, high quality, transparent background`
- **Negative**:
  - `text, watermark, logo, signature, blurry, lowres, noisy, jpeg artifacts, ugly, deformed, extra limbs, bad anatomy, messy lines`

## Zelos style tail (copy/paste)
These tokens help keep a consistent “Zelos V2” vibe while still allowing a cartoon illustration look:

- `clean cartoon illustration, crisp lineart, consistent line weight, subtle gradients, neon cyan accents, top-left lighting, simple shading, high quality, centered, transparent background`

If it becomes too “vector-flat”, add:
- `soft shading, gentle rim light`

If it becomes too painterly, add:
- `flat colors, minimal texture, smooth surfaces`

## Asset-specific prompt recipes

### Planets (sprites/planets)
Goal: readable silhouette, simple lighting, a few iconic features.

- Positive:
  - `stylized planet, front view, centered, simple background, clean cartoon illustration, crisp lineart, subtle gradients, soft terminator shadow, small highlights, neon cyan accents, high quality, transparent background`
- Negative:
  - `stars background, space background, text, watermark, photo, ultra realistic, noisy, grainy`

### Astro-duck face expressions (sprites/astro-duck/expressions)
Goal: consistent head shape, big readable eyes, clear emotion.

- Positive:
  - `cute astronaut duck, head and shoulders, <EXPRESSION>, front view, centered, clean cartoon illustration, crisp lineart, simple shading, cyan trim on suit, high quality, transparent background`
- Negative:
  - `full body, busy background, text, watermark, blurry, deformed beak, inconsistent eyes`

### UI icons (ui/...)
Goal: simple forms, crisp edges, minimal shading.

- Positive:
  - `game UI icon, <SUBJECT>, simple shapes, clean cartoon illustration, crisp lineart, minimal shading, flat colors, high contrast, centered, transparent background`
- Negative:
  - `photorealistic, complex background, tiny unreadable details, text, watermark`

## How this interacts with AssetGen automation
The generator already injects a style header and negative prompt defaults.
If you want Juggernaut XL to be more “cartoon illustration” consistently, the best lever is to:
- slightly reduce CFG (often 5–6)
- keep the style tail consistent across all assets
- avoid mixing many art styles in one prompt

## Quick workflow: generate a small batch
1) Start ComfyUI locally:
- `powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-comfyui-local.ps1`

2) Generate planets first (VRAM-safe):
- `py -3.11 scripts/comfyui/generate-assets.py --report build/zelos-report.json --only "^sprites/planets/" --limit 20 --fit-vram --max-render-dim 768`

3) Re-validate:
- `py -3.11 scripts/validate-assets.py --root assets/zelos --check-size`

## Troubleshooting
- **OOM / CUDA out of memory**: use `--fit-vram --max-render-dim 768` (or 640), and lower steps.
- **Background not transparent**: SDXL txt2img usually outputs opaque images. Use the generator’s `--auto-alpha` to remove a plain background and write a real transparent PNG.
  - Example: `py -3.11 scripts/comfyui/generate-assets.py --report build/zelos-report.json --only "^sprites/planets/" --limit 10 --fit-vram --auto-alpha`
  - Note: this works best when the subject is centered and the background is mostly uniform.
- **Prompt not followed**: reduce prompt length; move critical tokens earlier; increase steps a little.
