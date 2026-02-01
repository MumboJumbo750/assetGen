# Pony Diffusion v6 XL (SDXL) prompting + workflow notes

Source model card:
- https://huggingface.co/LyliaEngine/Pony_Diffusion_V6_XL

This repo supports Pony Diffusion v6 XL as a checkpoint variant via:
- `--prompt-style pony`

## Critical workflow requirement: CLIP skip 2

Per the model card:
- You **must** load Pony Diffusion v6 XL with **CLIP skip 2** (sometimes shown as `-2`).
- Without clip skip 2, outputs tend to degrade into low-quality blobs.

In ComfyUI, this is represented by a `CLIPSetLastLayer` node with:
- `stop_at_clip_layer: -2`

This repo includes a Pony-specific ComfyUI workflow JSON that already applies this:
- `scripts/comfyui/workflows/assetgen_sdxl_api_pony.json`

The generator auto-selects this workflow when you run with `--prompt-style pony` (unless you pass `--workflow`).

## Recommended sampler / steps

From the model card guidance:
- Recommended: `Euler a`, ~`25` steps, resolution ~`1024px`.

The Pony workflow shipped in this repo uses:
- `sampler_name: euler_ancestral` (ComfyUI name for "Euler a")
- `steps: 25`
- `scheduler: karras`

## Prompt template (recommended)

The model card recommends an “opinionated template” that works well without a negative prompt:

- `score_9, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up, <describe what you want>, tag1, tag2`

It also supports optional dataset tags:
- Source tags: `source_pony`, `source_furry`, `source_cartoon`, `source_anime`
- Rating tags: `rating_safe`, `rating_questionable`, `rating_explicit`

## Repo preset for `--prompt-style pony`

In this repo, `--prompt-style pony` sets a global style header that follows the model card guidance and keeps things SFW by default:
- Includes the full `score_9..score_4_up` string (mandatory per the model card)
- Adds `rating_safe` (you can optionally add a `source_*` tag per the model card if desired)
- Keeps additional style descriptors **minimal** (no extra quality boosters like "masterpiece", no redundant aesthetic tags) since the model is designed to not need them

The prompt header is intentionally concise:
```
score_9, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up, rating_safe, cyberpunk, comic style, bold lineart, cel shading, high contrast, neon colors, game asset, centered, isolated subject, simple white background
```

Note: the model card says negatives are usually unnecessary. For game assets we still use a **minimal negative prompt** to discourage:
- watermarks / text / usernames / urls
- busy background scenes

The model may still occasionally produce pseudo-signatures (a known training artifact called out in the model card).

## VAE

This repo supports an optional VAE override:
- `--vae sdxl_vae.safetensors`

The default SDXL workflows in this repo include a `VAELoader` node so `--vae` can be applied.

## Quick sample run (Pony)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-checkpoint-sample.ps1 -Variant pony -Checkpoint ponyDiffusionV6XL_v6StartWithThisOne.safetensors -PromptStyle pony -Vae sdxl_vae.safetensors
```

Outputs will land in:
- `assets/zelos_variants/pony/...`

Add/confirm the variant entry exists in:
- `preview/data/manifest.json`
