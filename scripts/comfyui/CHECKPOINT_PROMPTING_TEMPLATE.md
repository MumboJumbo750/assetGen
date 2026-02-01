# Checkpoint Prompting Guide Template (AssetGen)

Use this template when adding a new checkpoint (SDXL model) to the AssetGen pipeline.

## What this checkpoint is

- **Checkpoint name (file)**: `<checkpoint-file>.safetensors`
- **Model page / docs**: `<URL>`
- **Best for**: `<e.g. anime, cartoon, painterly, semi-realistic>`
- **Notes / gotchas**: `<e.g. needs tag-style prompts, prefers low CFG, etc.>`

## How we run it in this repo

- ComfyUI workflow: `.comfyui/ComfyUI/user/default/workflows/assetgen_sdxl_api.json`
- Generator: `scripts/comfyui/generate-assets.py`
- Variant output folder: `assets/zelos_variants/<variant>/...`

### Recommended command (example)

- Create a report targeting the variant folder:

  - `py -3.11 scripts/validate-assets.py --root assets/zelos_variants/<variant> --report json --report-path build/<variant>-report.json`

- Generate a small test batch first:

  - `py -3.11 scripts/comfyui/generate-assets.py --report build/<variant>-report.json --variant <variant> --ckpt <checkpoint-file>.safetensors --only "^sprites/planets/" --limit 10 --fit-vram --max-render-dim 768 --auto-alpha`

- Preview comparison:

  - Run the preview app and switch **Variant** in the UI.

## Prompting style

Describe how the model likes to be prompted.

- **Prompt format**: `<natural language | tag list | hybrid>`
- **Ordering**: `<subject first, then camera, then style tail>`
- **Quality tags**: `<if any>`
- **Rating/safety tags**: `<if any>`

## Recommended settings (starting point)

These typically live in the ComfyUI workflow (sampler, steps, CFG). Capture what worked.

- Sampler: `<euler a / euler / dpmpp_2m ...>`
- Steps: `<e.g. 24–32>`
- CFG: `<e.g. 5–7>`
- Notes: `<e.g. lower CFG for fewer artifacts>`

## Positive / negative prompt templates

Provide copy/paste templates that align with our repo requirements (centered, isolated, transparent background).

- **Positive**:
  - `<SUBJECT>, <VIEW>, <COMPOSITION>, <STYLE>, centered, isolated, transparent background`
- **Negative**:
  - `text, watermark, logo, signature, blurry, lowres, jpeg artifacts, bad anatomy, extra limbs, messy background`

## Asset-specific tips

Add per-category advice for the assets we generate.

- Planets: `<what to emphasize>`
- Satellites: `<what to emphasize>`
- Astro-duck: `<what to emphasize>`
- UI/effects: `<what to emphasize>`

## Known failure modes

- `<e.g. adds background, changes silhouette, inconsistent line weight>`

## Troubleshooting

- OOM: use `--fit-vram` and reduce steps
- Opaque background: use `--auto-alpha`
