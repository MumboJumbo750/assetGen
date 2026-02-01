# AssetGen → ComfyUI (SDXL) workflow (API format)

Copy this file into your ComfyUI folder (recommended location):
- `C:\projects\imageai\ComfyUI\user\default\ASSETGEN_SDXL_WORKFLOW.md`

This defines the **minimal SDXL txt2img workflow** that the AssetGen repo can drive automatically.

## What you must add to the ComfyUI repo

## Option A (recommended): run ComfyUI *from this repo*

This repo can host a local ComfyUI clone under `.comfyui/` (gitignored) so everything
is in one place.

1) Bootstrap ComfyUI into this repo:
- `powershell -ExecutionPolicy Bypass -File scripts/comfyui/setup-comfyui-local.ps1`

2) Run ComfyUI:
- `powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-comfyui-local.ps1`

ComfyUI will be at `http://127.0.0.1:8188` by default.

Then continue with the workflow JSON steps below (same workflow file path, but under
the local `.comfyui/ComfyUI` directory).

## Option B: use your existing `C:\projects\imageai\ComfyUI`

### 1) Install an SDXL checkpoint
Put an SDXL checkpoint file here:
- `C:\projects\imageai\ComfyUI\models\checkpoints\YOUR_SDXL_MODEL.safetensors`

Notes
- Your current install has no checkpoints (only `put_checkpoints_here`).
- Use an **SDXL** checkpoint (not SD1.5). If you use a Turbo/Lightning model, adjust steps/CFG accordingly.

### 2) Start ComfyUI
Use your existing launcher:
- `powershell -ExecutionPolicy Bypass -File C:\projects\imageai\run-comfyui.ps1`

Default URL:
- `http://127.0.0.1:8188`

### 3) Save the workflow JSON (API format)
Create this file (exact path recommended):
- `C:\projects\imageai\ComfyUI\user\default\workflows\assetgen_sdxl_api.json`

If you're using the in-repo ComfyUI clone (`.comfyui/ComfyUI`), use this path instead:
- `.comfyui/ComfyUI/user/default/workflows/assetgen_sdxl_api.json`

Paste the JSON below and **only change** `ckpt_name` to match your checkpoint filename.

This JSON is in ComfyUI **API prompt** format (the format used by the `/prompt` endpoint).

## SDXL txt2img workflow JSON (API prompt format)

```json
{
  "1": {
    "class_type": "CheckpointLoaderSimple",
    "inputs": {
      "ckpt_name": "YOUR_SDXL_MODEL.safetensors"
    }
  },
  "2": {
    "class_type": "CLIPTextEncodeSDXL",
    "inputs": {
      "clip": [
        "1",
        1
      ],
      "text_g": "POSITIVE_PROMPT_WILL_BE_OVERWRITTEN",
      "text_l": "POSITIVE_PROMPT_WILL_BE_OVERWRITTEN",
      "width": 1024,
      "height": 1024,
      "crop_w": 0,
      "crop_h": 0,
      "target_width": 1024,
      "target_height": 1024
    }
  },
  "3": {
    "class_type": "CLIPTextEncodeSDXL",
    "inputs": {
      "clip": [
        "1",
        1
      ],
      "text_g": "NEGATIVE_PROMPT_WILL_BE_OVERWRITTEN",
      "text_l": "NEGATIVE_PROMPT_WILL_BE_OVERWRITTEN",
      "width": 1024,
      "height": 1024,
      "crop_w": 0,
      "crop_h": 0,
      "target_width": 1024,
      "target_height": 1024
    }
  },
  "4": {
    "class_type": "EmptyLatentImage",
    "inputs": {
      "width": 1024,
      "height": 1024,
      "batch_size": 1
    }
  },
  "5": {
    "class_type": "KSampler",
    "inputs": {
      "model": [
        "1",
        0
      ],
      "positive": [
        "2",
        0
      ],
      "negative": [
        "3",
        0
      ],
      "latent_image": [
        "4",
        0
      ],
      "seed": 123456,
      "steps": 28,
      "cfg": 7,
      "sampler_name": "euler",
      "scheduler": "karras",
      "denoise": 1
    }
  },
  "6": {
    "class_type": "VAEDecode",
    "inputs": {
      "samples": [
        "5",
        0
      ],
      "vae": [
        "1",
        2
      ]
    }
  },
  "7": {
    "class_type": "SaveImage",
    "inputs": {
      "images": [
        "6",
        0
      ],
      "filename_prefix": "assetgen"
    }
  }
}
```

## How AssetGen will use this workflow

The repo script [scripts/comfyui/generate-assets.py](scripts/comfyui/generate-assets.py) will:
- overwrite **positive + negative** prompts (it supports SDXL `text_g`/`text_l`)
- overwrite **width/height** (it updates `EmptyLatentImage` and SDXL `target_width/target_height`)
- optionally overwrite **seed** if you pass `--seed`
- download the resulting image via ComfyUI’s `/view` endpoint
- write it directly into `assets/zelos/...` paths defined by the validator JSON report

## Quick test (end-to-end)

1) In the AssetGen repo, create a JSON missing-assets report:
- `py -3.11 scripts/validate-assets.py --root assets/zelos --report json --report-path build/zelos-report.json`

2) Dry run (no Comfy calls):
- `py -3.11 scripts/comfyui/generate-assets.py --report build/zelos-report.json --workflow C:\projects\imageai\ComfyUI\user\default\workflows\assetgen_sdxl_api.json --dry-run --limit 10`

3) Generate only planets (small + fast):
- `py -3.11 scripts/comfyui/generate-assets.py --report build/zelos-report.json --workflow C:\projects\imageai\ComfyUI\user\default\workflows\assetgen_sdxl_api.json --only "^sprites/planets/" --limit 20`

## Important limitation: transparency

Most SDXL txt2img workflows output opaque RGB images.
If you need **true transparent PNGs** for sprites/UI, you’ll want an additional background/alpha workflow step (often via custom nodes).
Start with this minimal workflow first to validate the automation loop, then add alpha removal once you pick a method.
