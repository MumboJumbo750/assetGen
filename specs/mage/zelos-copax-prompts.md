# Prompt Pack: Zelos V2 + Copax Timeless (SDXL)

This prompt pack is tailored for **Copax Timeless** while keeping the **Zelos V2** asset requirements consistent.

Aligns with:
- `database/specs/zelos-asset-index.json`
- `scripts/comfyui/generate-assets.py`

## Goals
- A slightly more "classic" illustration look.
- Still crisp enough for sprites and UI.
- Simple background for clean alpha extraction.

## Copax style header

"Zelos V2, timeless illustration, clean lineart, crisp edges, elegant shapes, gentle shading, vibrant but controlled palette, neon cyan accents, game asset, centered, isolated, plain white background"

## Global negative prompt

"lowres, blurry, noisy, grainy, jpeg artifacts, watermark, logo, signature, text, background scene, clutter, overly photorealistic, deformed, bad anatomy, extra limbs"

## Starting settings
- Steps: 24â€“32 (start 28)
- CFG: 5â€“7
- Sampler: Euler (or Euler a)
- Scheduler: Karras

## Automation usage

- `--prompt-style copax`
- `--ckpt <your copax .safetensors filename>`
- Variant output folder: `assets/zelos_variants/copax/...`

