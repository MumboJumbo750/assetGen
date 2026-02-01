# Prompt Pack: Zelos V2 + ProtoVision XL (SDXL)

This prompt pack is tailored for **ProtoVision XL** while keeping the **Zelos V2** asset requirements (naming, sizes, overlays) consistent.

It is designed to align with:
- `specs/zelos-asset-index.json`
- `scripts/comfyui/generate-assets.py` (path-based prompt mapping)

## High-level goals
- **High fidelity** but still readable at game scale.
- **Clean silhouettes** and sharp edges.
- **Simple background** (white) so `--auto-alpha` can cut clean transparency.

## ProtoVision style header (prepend to all prompts)

Use this as a stable prefix:

"Zelos V2, high fidelity anime illustration, crisp lineart, clean edges, sharp focus, subtle 3D shading, soft studio lighting, vibrant but controlled colors, neon cyan accents, game asset, centered, isolated, plain white background"

## Global negative prompt

"lowres, blurry, soft focus, out of focus, noisy, grainy, jpeg artifacts, watermark, logo, signature, text, background scene, scenery, detailed background, clutter, messy lineart, sketch, deformed, bad anatomy, extra limbs"

## Starting generation settings (recommended)
- Steps: 24–32 (start 28)
- CFG: 5–7 (start 6)
- Sampler: Euler (or Euler a)
- Scheduler: Karras

## Automation usage

- `--prompt-style protovision`
- `--ckpt <your protovision .safetensors filename>`
- Variant output folder: `assets/zelos_variants/protovision/...`
