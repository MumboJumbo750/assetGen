# Prompt Pack: Zelos V2 + Animagine XL (SDXL)

This prompt pack is tailored for **Animagine XL 3.x** (e.g. Animagine XL v3.1 checkpoints) while keeping the **Zelos V2** asset requirements (naming, sizes, overlays) consistent.

It is designed to align with the asset paths in:
- `specs/zelos-asset-index.json`

And the automation path-based prompt mapping in:
- `scripts/comfyui/generate-assets.py`

## High-level goals

- **Anime-leaning, clean game-asset look** while still reading as “Zelos UI/game art”.
- **Consistency** across the whole set: stable lighting, stable line weight, stable palette bias.
- **Overlay friendliness**: outfits/expressions should not redraw the base body.

## Animagine prompting basics (tag ordering)

Animagine XL 3.x is trained for **tag-like prompts** and benefits from consistent ordering.
For our original assets, use this structure:

- `rating: general, <quality/year>, <subject>, <view/camera>, <style tail>, <constraints>`

Where:
- `<quality/year>`: use a light touch (e.g. `high quality` + `newest` + `sharp focus`)
- `<constraints>`: always include `centered`, `isolated`, `white background`, `simple background`, `no background` (even if post-processed with --auto-alpha)

## Animagine-friendly style tail (append to all prompts)

Use this as a stable “style lock” tail:

- `sharp focus, crisp lineart, consistent line weight, simple soft shading, subtle gradients, vibrant but controlled palette, neon cyan accents, top-left key light, gentle rim light, clean edges, game asset, centered, isolated, white background, simple background, no background`

If results get too detailed/noisy, append:
- `minimal detail, simple shapes, no texture noise`

If results get too flat, append:
- `soft material highlights, gentle ambient occlusion`

## Global negative prompt (Animagine baseline)

Animagine’s docs recommend a broad negative list to avoid common failure modes. Use this as a stable baseline and add Zelos-specific exclusions.

**Critical for transparency and sharpness:** always include `blurry, out of focus, background scene, scenery, detailed background`.

- `nsfw, lowres, blurry, out of focus, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, artist name, background scene, scenery, detailed background, clutter`

## Starting generation settings (recommended)

Good starting points (tune in the workflow):

- Steps: 24–28 (lower is often sharper for Animagine; start 25)
- CFG: 5–6 (lower CFG helps sharpness; start 5)
- Sampler: Euler a (or Euler)
- Scheduler: Karras (if your workflow uses it)
- VRAM: use `--fit-vram --max-render-dim 768` and upscale

## Prompt recipes by asset path

Use the templates below as the target language for Animagine. They map 1:1 to our asset paths.

### 1) Astro-duck base views

Paths:
- `sprites/astro-duck/base/astro-duck-base-front.png`
- `sprites/astro-duck/base/astro-duck-base-side.png`
- `sprites/astro-duck/base/astro-duck-base-three-quarter.png`

Prompt template:

- `rating: general, high quality, newest, 1animal, duck mascot, astronaut, original character, minimal undersuit (no outer suit), chibi proportions, <VIEW> view, full body, clean lineart, simple shading, neon cyan accents, centered, isolated, transparent background`

Notes:
- Keep “undersuit only” consistent; outfits are separate overlays.
- Avoid props; they shift silhouette and break overlays.

### 2) Astro-duck base spritesheets

Paths:
- `sprites/astro-duck/base/astro-duck-base-idle-sheet.png` (2048x256)
- `sprites/astro-duck/base/astro-duck-base-fly-sheet.png` (1536x256)

Prompt templates:

- Idle sheet:
  - `rating: general, high quality, newest, sprite sheet, 8-frame horizontal, cute astronaut duck in minimal undersuit, idle float animation, each frame 256x256, aligned frames, consistent spacing, clean lineart, transparent background`

- Fly sheet:
  - `rating: general, high quality, newest, sprite sheet, 6-frame horizontal, cute astronaut duck in minimal undersuit, jetpack flying animation, each frame 256x256, aligned frames, consistent spacing, clean lineart, transparent background`

Notes:
- Text-to-image alignment is “best effort” until we add a dedicated spritesheet workflow.

### 3) Astro-duck expressions (face-only overlays)

Pattern:
- `sprites/astro-duck/expressions/astro-duck-{expression}-{view}.png`

Expression list (from spec):
- happy, excited, curious, concerned, celebrating, sleeping, waving, pointing

Prompt template:

- `rating: general, high quality, newest, Astro-Duck face overlay only, <EXPRESSION> expression, matches base head shape and eye placement, <VIEW> view, clean lineart, simple shading, centered, isolated, transparent background`

Notes:
- Keep it face-only so it layers cleanly over outfits.
- For action-like ids (waving/pointing/celebrating/sleeping), keep any glyphs small and near the head.

### 4) Astro-duck outfits (overlay-only)

Pattern:
- `sprites/astro-duck/outfits/{outfit}-{view}.png`

Outfits (from spec):
- outfit-default-suit: space suit overlay with cyan trim
- outfit-pirate: tricorn hat, eye patch, small cape
- outfit-wizard: starry hat, glowing cyan wand
- outfit-detective: deerstalker hat, magnifying glass
- outfit-chef: chef hat, apron, glowing spatula
- outfit-superhero: cape, small mask
- outfit-scientist: lab goggles, glowing beaker
- outfit-musician: neon headphones, small synth
- outfit-explorer: safari hat, binoculars
- outfit-ninja: headband, throwing star
- outfit-royal: crown, royal cape

Prompt template:

- `rating: general, high quality, newest, Astro-Duck outfit overlay only, costume pieces only, no body, no head redraw, <OUTFIT_DESCRIPTION>, aligned to base undersuit silhouette, <VIEW> view, clean lineart, centered, isolated, transparent background`

Notes:
- Be aggressive about “overlay only” or the model will redraw the character.

### 5) Outfit animation overlays (idle/fly sheets)

Patterns:
- `sprites/astro-duck/outfits/{outfit}-idle-sheet.png`
- `sprites/astro-duck/outfits/{outfit}-fly-sheet.png`

Prompt templates:

- Idle overlay:
  - `rating: general, high quality, newest, sprite sheet overlay only, 8-frame horizontal, Astro-Duck outfit overlay only (no body), costume pieces only, <OUTFIT_DESCRIPTION>, aligned to base idle sheet, each frame 256x256, total 2048x256, transparent background`

- Fly overlay:
  - `rating: general, high quality, newest, sprite sheet overlay only, 6-frame horizontal, Astro-Duck outfit overlay only (no body), costume pieces only, <OUTFIT_DESCRIPTION>, aligned to base fly sheet, each frame 256x256, total 1536x256, transparent background`

### 6) Planets (texture / overlays)

Patterns:
- `sprites/planets/texture-{texture}.png`
- `sprites/planets/ring-{ring}.png`
- `sprites/planets/atmosphere-{atmosphere}.png`
- `sprites/planets/state-{state}.png`

Prompt templates:

- Texture:
  - `rating: general, high quality, newest, planet, spherical, <TEXTURE> material cues, clean silhouette, subtle terminator shadow, small highlight, clean lineart, centered, isolated, transparent background`

- Ring:
  - `rating: general, high quality, newest, saturn rings overlay, <RING> color, semi-transparent, centered, isolated, transparent background`

- Atmosphere:
  - `rating: general, high quality, newest, atmosphere halo overlay, soft gradient ring, <ATMOSPHERE> thickness, centered, isolated, transparent background`

- State:
  - `rating: general, high quality, newest, planet state overlay, <STATE> styling, neon accent ring or glow, centered, isolated, transparent background`

### 7) Satellites (icons + overlays)

Patterns:
- `sprites/satellites/satellite-{icon}.png`
- `sprites/satellites/state-{state}.png`
- `sprites/satellites/glow-{glow}.png`
- `sprites/satellites/badge-{badge}.png`

Prompt templates:

- Icon:
  - `rating: general, high quality, newest, satellite UI icon, <ICON> symbol, clean readable silhouette, minimal shading, neon cyan accent, centered, isolated, transparent background`

- State:
  - `rating: general, high quality, newest, satellite state overlay ring or glow, <STATE> styling, centered, isolated, transparent background`

- Glow:
  - `rating: general, high quality, newest, soft neon halo ring overlay, <GLOW> styling, centered, isolated, transparent background`

- Badge:
  - `rating: general, high quality, newest, small badge overlay, <BADGE> styling, anchored lower-right, centered canvas, transparent background`

## Notes on transparency

Many SDXL txt2img workflows produce opaque images even if you say “transparent background”.
For now:

- Keep the prompt constraint `transparent background` to encourage clean backgrounds.
- Use the generator `--auto-alpha` to write a true transparent PNG.

## How to use this with AssetGen

- If you’re using the generator, it already generates prompts per asset path.
- This file is the “style target” prompt language for Animagine XL; you can:

  - keep it as a human reference, or
  - update the generator’s prompt templates if you want stronger Animagine-optimized phrasing.
