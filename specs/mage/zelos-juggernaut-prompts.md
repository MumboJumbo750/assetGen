# Prompt Pack: Zelos V2 + Juggernaut XL (SDXL)

This prompt pack is tailored for **Juggernaut XL (SDXL checkpoint)** while keeping the **Zelos V2** asset requirements (naming, sizes, overlays) consistent.

It is designed to align with the asset paths in:
- `specs/zelos-asset-index.json`

And the automation path-based prompt mapping in:
- `scripts/comfyui/generate-assets.py`

## High-level goals
- **Cartoon illustration** look (clean, readable shapes) without drifting into photorealism.
- **Consistency** across the entire asset set: same lighting direction, line weight, palette bias.
- **Overlay friendliness**: outfits/expressions should stay aligned and not redraw the base body.

## Juggernaut-friendly style header (prepend to all prompts)
Use this as a stable “style lock” prefix:

"Zelos V2 cartoon illustration style, crisp lineart, consistent line weight, simple soft shading, subtle gradients, vibrant but controlled palette, neon cyan accents, top-left key light, gentle rim light, clean edges, game asset, centered, isolated subject, transparent background"

If results get too painterly, append:
- "flat colors, minimal texture, no brush strokes"

If results get too flat/vector, append:
- "soft shading, slight material highlights"

## Global negative prompt
Use this as a stable baseline negative prompt:

"photorealistic, realistic skin, 3d render, pixel art, lowres, blurry, noisy, grainy, jpeg artifacts, watermark, logo, signature, text, typography, background scene, clutter, messy lineart, sketch, deformed, bad anatomy, extra limbs"

## Starting generation settings (recommended)
These are good starting points for Juggernaut XL on your GTX 1060 6GB:
- Steps: 24–32 (start 28)
- CFG: 5–7 (start 6)
- Sampler: Euler (or DPM++ 2M if your workflow uses it)
- Scheduler: Karras
- VRAM: use `--fit-vram --max-render-dim 768` and upscale

## Prompt recipes by asset path

### 1) Astro-duck base views
Paths:
- `sprites/astro-duck/base/astro-duck-base-front.png`
- `sprites/astro-duck/base/astro-duck-base-side.png`
- `sprites/astro-duck/base/astro-duck-base-three-quarter.png`

Prompt template:
"<STYLE_HEADER>. cute astronaut duck mascot wearing a minimal undersuit (no outer suit), chibi proportions (large head), smooth simple materials, bubble helmet optional and transparent, <VIEW> view, full body, centered"

Notes:
- Keep “undersuit only” consistent; outfits are separate overlays.
- Avoid busy props; they break overlay alignment later.

### 2) Astro-duck base spritesheets
Paths:
- `sprites/astro-duck/base/astro-duck-base-idle-sheet.png` (2048x256)
- `sprites/astro-duck/base/astro-duck-base-fly-sheet.png` (1536x256)

Prompt templates:
- Idle sheet:
  - "<STYLE_HEADER>. 8-frame horizontal sprite sheet, cute astronaut duck in minimal undersuit, floating idle animation, each frame 256x256, total size 2048x256, consistent spacing, aligned frames"
- Fly sheet:
  - "<STYLE_HEADER>. 6-frame horizontal sprite sheet, cute astronaut duck in minimal undersuit, jetpack flying animation, each frame 256x256, total size 1536x256, consistent spacing, aligned frames"

Notes:
- Text-to-image may not perfectly align frames; treat these as “best effort” until we add a dedicated spritesheet workflow.

### 3) Astro-duck expressions (face-only overlays)
Pattern:
- `sprites/astro-duck/expressions/astro-duck-{expression}-{view}.png`

Expression list (from spec):
- happy, excited, curious, concerned, celebrating, sleeping, waving, pointing

Prompt template:
"<STYLE_HEADER>. Astro-Duck face overlay only (no body), <EXPRESSION> expression, matches base head shape and eye placement, <VIEW> view, centered"

Notes:
- Keep it face-only so it layers cleanly over any outfit.
- For action-like ids (waving/pointing/celebrating/sleeping), keep any glyphs small and close to the head.

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
"<STYLE_HEADER>. Astro-Duck outfit overlay only (no body, no head redraw), <OUTFIT_DESCRIPTION>, aligned to base undersuit silhouette, <VIEW> view, centered"

Notes:
- Strongly emphasize “overlay only / no body redraw”.
- If the model keeps redrawing the whole character, add: "costume pieces only".

### 5) Outfit animation overlays (idle/fly sheets)
Patterns:
- `sprites/astro-duck/outfits/{outfit}-idle-sheet.png`
- `sprites/astro-duck/outfits/{outfit}-fly-sheet.png`

Prompt templates:
- Idle overlay:
  - "<STYLE_HEADER>. 8-frame horizontal sprite sheet, Astro-Duck outfit overlay only (no body), <OUTFIT_DESCRIPTION>, aligned to base idle sheet, each frame 256x256, total size 2048x256"
- Fly overlay:
  - "<STYLE_HEADER>. 6-frame horizontal sprite sheet, Astro-Duck outfit overlay only (no body), <OUTFIT_DESCRIPTION>, aligned to base fly sheet, each frame 256x256, total size 1536x256"

### 6) Planets (texture / overlays)
Patterns:
- `sprites/planets/texture-{texture}.png`
- `sprites/planets/ring-{ring}.png`
- `sprites/planets/atmosphere-{atmosphere}.png`
- `sprites/planets/state-{state}.png`

Planet textures (from spec):
- solid, gradient, marble, rocky, gas-giant, ice, lava, ocean, forest, tech

Prompt templates:
- Texture:
  - "<STYLE_HEADER>. stylized planet texture icon, <TEXTURE> material cues, simple readable shapes, subtle gradients, terminator shadow, small highlight, centered"
- Ring:
  - "<STYLE_HEADER>. saturn-like rings overlay, <RING> color, semi-transparent, centered"
- Atmosphere:
  - "<STYLE_HEADER>. atmosphere halo overlay, soft gradient ring, <ATMOSPHERE> thickness, centered"
- State:
  - "<STYLE_HEADER>. planet state overlay, <STATE> styling, neon accent ring/glow, centered"

### 7) Satellites (icons + overlays)
Patterns:
- `sprites/satellites/satellite-{icon}.png`
- `sprites/satellites/state-{state}.png`
- `sprites/satellites/glow-{glow}.png`
- `sprites/satellites/badge-{badge}.png`

Satellite icons (from spec):
- config, portals, style, modules, entrypoints, statistics, users, offerers, email, wordpress

Prompt templates:
- Icon:
  - "<STYLE_HEADER>. satellite UI icon, <ICON> symbol, clean readable silhouette, minimal shading, neon cyan accent, centered"
- State:
  - "<STYLE_HEADER>. satellite state overlay ring/glow, <STATE> styling, centered"
- Glow:
  - "<STYLE_HEADER>. soft neon halo ring overlay, <GLOW> styling, centered"
- Badge:
  - "<STYLE_HEADER>. small badge overlay, <BADGE> styling, anchored lower-right, centered canvas"

## Notes on transparency
Many SDXL txt2img workflows produce opaque images even if you say “transparent background”.
For now we treat “transparent background” as “plain/empty background”; later we can add a background-removal step to the workflow once generation quality is acceptable.

## How to use this with AssetGen
- If you’re using the generator, it already generates prompts per asset path.
- This file is the “style target” prompt language for Juggernaut XL; you can:
  1) keep it as a human reference, or
  2) update the generator’s `STYLE_HEADER` / prompt templates to match this pack if you want stronger Juggernaut-optimized phrasing.
