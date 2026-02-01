# Animagine XL (SDXL) Prompting Guide (AssetGen)

This guide adapts **Animagine XL 3.x** prompting guidance for our AssetGen workflow.

For the checkpoint-specific Zelos prompt pack (path-based recipes), see:
- `specs/mage/zelos-animagine-prompts.md`

Reference docs (3.0; 3.1 is a continuation in the same family):

[HuggingFace: cagliostrolab/animagine-xl-3.0](https://huggingface.co/cagliostrolab/animagine-xl-3.0)

## What we’re using

- Checkpoint: `animagineXLV31_v31.safetensors` (as provided by you)
- Generator: `scripts/comfyui/generate-assets.py`
- Variant output folder: `assets/zelos_variants/animagine/...`

## Key difference vs Juggernaut: tag-style prompts

Animagine XL 3.x was trained with **structured tag ordering**. The model docs recommend:

- `1girl/1boy, character name, from what series, everything else in any order`

For **our original game assets** (not fanart), we still benefit from the structure, but we can replace the “character name/series” part with our own subject tags:

- Example structure for us:
  - `1animal, duck, astronaut, original character, <pose/expression>, <view>, <style tail>, <constraints>`

## Safety / rating tags

The model supports rating modifiers and the docs note that heavy “quality” tags can correlate with NSFW datasets.

For AssetGen, keep it safe and consistent:

- Put `rating: general` in the positive prompt.
- Put `nsfw` in the negative prompt.

## Recommended starting settings (ComfyUI)

From the model docs, good starting points are:

- **Sampler**: Euler Ancestral (`euler a`)
- **Steps**: below ~30
- **CFG**: ~5–7

(These are configured in the ComfyUI workflow; the generator already injects prompts + width/height.)

## Prompt templates (AssetGen-friendly)

### General template (sprites/icons)

Use short, tag-like prompts and keep constraints explicit.

- **Positive** (template):
  - `rating: general, high quality, newest, <SUBJECT TAGS>, <VIEW>, centered, isolated, transparent background, clean lineart, simple shading, game asset`

- **Negative** (template):
  - `nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry`

Notes:

- If the model starts adding backgrounds, move `isolated, transparent background, plain background` earlier.
- If the result becomes too “anime screenshot”, add `simple shapes, minimal detail, UI-ready`.

### Planets

- **Positive**:
  - `rating: general, high quality, newest, planet, spherical, centered, isolated, simple shading, subtle terminator shadow, clean silhouette, game asset, transparent background`
- **Negative**:
  - `starfield, space background, scenery, text, watermark, photorealistic, noisy`

### Satellites / overlays

- **Positive**:
  - `rating: general, high quality, newest, game UI icon, satellite module icon, flat colors, crisp lineart, minimal shading, centered, isolated, transparent background`
- **Negative**:
  - `background scene, tiny unreadable details, text, watermark`

### Astro-duck expressions

- **Positive**:
  - `rating: general, high quality, newest, 1animal, duck, astronaut suit, mascot, head and shoulders, <EXPRESSION>, <VIEW>, centered, isolated, transparent background, clean lineart, simple shading`
- **Negative**:
  - `full body, background, text, watermark, deformed beak, inconsistent eyes`

## How to run Animagine in this repo

The generator now has a `--prompt-style animagine` flag that switches to tag-based prompting optimized for Animagine XL 3.x.

### Quick test with checkpoint sample set

Run a diverse sample (37 assets across all categories) to evaluate the checkpoint:

```powershell
# 1. Create the variant folder structure
mkdir assets/zelos_variants/animagine -Force

# 2. Generate a validator report for all missing assets
py -3.11 scripts/validate-assets.py --root assets/zelos_variants/animagine --report json --report-path build/animagine-report.json

# 3. Run the test samples (37 diverse assets: 3 base views, 6 expressions, 6 outfits, 5 planets, satellite states, etc.)
py -3.11 scripts/comfyui/generate-assets.py --report build/animagine-report.json --variant animagine --ckpt animagineXLV31_v31.safetensors --prompt-style animagine --fit-vram --max-render-dim 768 --auto-alpha --only "(astro-duck-base-(front|side|three-quarter)|astro-duck-(happy|excited|curious)-(front|side)|outfit-(default-suit|pirate|wizard)-(front|side)|texture-(ocean|lava|ice|gas-giant|tech)|satellite-(config|portals|modules)|ring-cyan|atmosphere-(thin|normal|thick)|state-(selected|hovered|error)|glow-(hover|selected)|badge-(warning|error))"
```

The test sample set is documented in `scripts/comfyui/checkpoint-test-sample.json`.

### Full batch generation

Once the test samples look good, generate all missing assets:

```powershell
py -3.11 scripts/comfyui/generate-assets.py --report build/animagine-report.json --variant animagine --ckpt animagineXLV31_v31.safetensors --prompt-style animagine --fit-vram --max-render-dim 768 --auto-alpha
```

Open the preview app and select **Variant: Animagine XL v3.1**.

## Troubleshooting

- **OOM**: use `--fit-vram --max-render-dim 768` (or 640) and reduce steps in the workflow.
- **Opaque backgrounds**: use `--auto-alpha`. Also ensure the negative includes `background scene, scenery, detailed background`.
- **Blurry results**: ensure negative includes `blurry, out of focus`. Try lowering steps (24-28) and CFG (5-6).
- **Prompt not followed**: shorten the prompt; put critical tags first; keep CFG closer to 5–6.
- **Too anime-like**: add `simple shapes, minimal detail, UI-ready, game asset icon` to the positive.
