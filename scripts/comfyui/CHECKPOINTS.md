# Checkpoints (comparison-ready)

This repo supports generating assets into variant folders for side-by-side checkpoint evaluation.

## Where to put checkpoints

Copy downloaded `.safetensors` files into:

- `.comfyui/ComfyUI/models/checkpoints/`

Then run the sample generator into a new variant folder.

## Recommended presets

These are *repo presets* (prompt header + negative prompt) used by `scripts/comfyui/generate-assets.py --prompt-style ...`.

- **ProtoVision XL** (CivitAI)
  - URL: https://civitai.com/models/125703/protovision-xl-high-fidelity-3d-photorealism-anime-hyperrealism-no-refiner-needed?modelVersionId=265938
  - Suggested: `--prompt-style protovision`

- **SD XL** (CivitAI)
  - URL: https://civitai.com/models/101055/sd-xl?modelVersionId=128078
  - Suggested: `--prompt-style sdxl`

- **Pony Diffusion v6 XL** (CivitAI)
  - URL (HF): https://huggingface.co/LyliaEngine/Pony_Diffusion_V6_XL
  - Suggested: `--prompt-style pony`
  - Note: requires CLIP skip 2 (repo uses a Pony-specific workflow by default)

- **Copax Timeless** (CivitAI)
  - URL: https://civitai.com/models/118111/copax-timeless?modelVersionId=1108377
  - Suggested: `--prompt-style copax`
  - Prompting guide: [COPAX_TIMELESS_PROMPTING.md](COPAX_TIMELESS_PROMPTING.md)
  - **Optimal settings** (auto-applied with `--prompt-style copax`):
    - Sampler: `dpmpp_3m_sde`
    - Scheduler: `exponential`
    - Steps: 35
    - CFG: 6.0
  - Notes:
    - Good for versatile illustration styles
    - Add `open mouth, ugly face, old face, long neck` to negative prompt
    - Use `--auto-alpha` for transparent backgrounds

## Quick sample run (recommended)

Use the generic runner:

```powershell
# Example (replace checkpoint filename with the one you downloaded)
powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-checkpoint-sample.ps1 -Variant protovision -Checkpoint <your_file.safetensors> -PromptStyle protovision

# Pony Diffusion example
powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-checkpoint-sample.ps1 -Variant pony -Checkpoint ponyDiffusionV6XL_v6StartWithThisOne.safetensors -PromptStyle pony
```

Notes:
- Variant outputs go to `assets/zelos_variants/<variant>/...`.
- Add the variant to `preview/data/manifest.json` to compare in the preview UI.
