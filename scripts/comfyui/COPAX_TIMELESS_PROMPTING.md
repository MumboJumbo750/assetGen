# Copax Timeless (SDXL) Prompting Guide (AssetGen)

This guide adapts **Copax Timeless** (SDXL XIV version) prompting guidance for our AssetGen workflow.

For the checkpoint-specific Zelos prompt pack (path-based recipes), see:
- `specs/mage/zelos-copax-prompts.md`

Reference docs:
- [CivitAI: Copax Timeless](https://civitai.com/models/118111/copax-timeless?modelVersionId=1108377)

## What we're using

- Checkpoint: `copaxTimelessxlSDXL1_v12.safetensors` (or any V12+ SDXL version)
- Base Model: **SDXL 1.0**
- Generator: `scripts/comfyui/generate-assets.py`
- Variant output folder: `assets/zelos_variants/copax/...`

## Key characteristics

Copax Timeless is focused on **diversity in styles** rather than a single specific look:
- Supports realistic, semi-realistic, painterly, and illustration styles
- Good skin details, facial features, material rendering
- Works well with dramatic lighting and color contrasts
- Focused on "timeless" aesthetic - can do modern, vintage, or fantasy

For **game assets**, we want to push it toward clean illustration with consistent lineart.

## Prompt style

Copax Timeless uses **natural language prompts** (not tag-based like Animagine). The model responds well to:
- Clear subject-first descriptions
- Specific style and lighting keywords
- Material and texture descriptions
- Explicit background constraints

## Recommended starting settings (ComfyUI)

From the official model documentation:

| Setting | Recommended Value | Notes |
|---------|------------------|-------|
| **Sampler** | `dpmpp_3m_sde` | Also works: `dpmpp_2m_sde`, `euler_ancestral`, `euler` |
| **Scheduler** | `exponential` | Also works: `karras` |
| **Steps** | 30-50 | Start with 35; increase for more detail |
| **CFG** | 5-7 | Lower (5) = softer; Higher (7) = sharper |
| **Resolution** | 1024×1024 | SDXL native; also: 768×1024, 1024×768 |

### V11-Lightning variant (fast generation)

If using the Lightning-merged variant:
- Steps: 8-15
- CFG: 1
- Sampler: `dpmpp_2m_sde` with `karras`
- Don't use Hires fix or set denoising strength to 0

## Negative prompt template

The model author recommends this baseline:

```
(worst quality, low quality, illustration, 3d, 2d), open mouth, tooth, ugly face, old face, long neck
```

**For AssetGen (game assets)**, we extend with our standard constraints:

```
(worst quality, low quality), photorealistic, realistic skin, 3d render,
lowres, blurry, noisy, grainy, jpeg artifacts, watermark, logo, signature, text,
background scene, scenery, clutter, deformed, bad anatomy, extra limbs,
open mouth, ugly face, old face, long neck
```

## Positive prompt template (AssetGen-friendly)

### General template (sprites/icons)

```
<SUBJECT>, <VIEW>, <COMPOSITION>, clean illustration style, crisp lineart,
elegant shapes, gentle shading, vibrant palette, neon cyan accents,
game asset, centered, isolated, plain white background
```

### Zelos-specific style header

```
Zelos V2, cyberpunk illustration, bold lineart, crisp edges, dynamic shapes,
cel shading with soft gradients, high contrast palette, neon cyan and magenta accents,
dramatic lighting, game asset, centered, isolated, plain white background
```

## Asset-specific prompt recipes

### Planets

Goal: readable silhouette, clean shading, a few iconic features.

**Positive:**
```
stylized planet, spherical, front view, centered, clean illustration,
crisp edges, simple shading, subtle terminator shadow, small highlights,
neon rim light, game asset, isolated, plain white background
```

**Negative:**
```
(worst quality, low quality), stars background, space scenery, photorealistic,
noisy, grainy, text, watermark
```

### Astro-duck expressions

Goal: consistent character, clear emotion, clean lineart.

**Positive:**
```
cute astronaut duck mascot, head and shoulders, <EXPRESSION>, <VIEW>,
clean illustration, crisp lineart, cel shading, cyan trim on space suit,
simple shapes, game asset, centered, isolated, plain white background
```

**Negative:**
```
(worst quality, low quality), full body, busy background, realistic,
text, watermark, deformed beak, inconsistent eyes, open mouth
```

### UI icons

Goal: simple forms, crisp edges, minimal shading.

**Positive:**
```
game UI icon, <SUBJECT>, simple shapes, clean illustration, crisp lineart,
minimal shading, flat colors, high contrast, neon accents,
centered, isolated, plain white background
```

**Negative:**
```
(worst quality, low quality), photorealistic, complex background,
tiny unreadable details, text, watermark
```

### Satellites / overlays

**Positive:**
```
satellite module, game UI icon, clean illustration, crisp lineart,
flat colors, minimal shading, neon glow accents,
centered, isolated, plain white background
```

**Negative:**
```
(worst quality, low quality), background scene, tiny details, text, watermark
```

## How to run Copax in this repo

The generator has a `--prompt-style copax` flag that switches to prompting optimized for Copax Timeless.

### Quick test with checkpoint sample set

```powershell
# 1. Create the variant folder structure
mkdir assets/zelos_variants/copax -Force

# 2. Generate a validator report for all missing assets
py -3.11 scripts/validate-assets.py --root assets/zelos_variants/copax --report json --report-path build/copax-report.json

# 3. Generate a small test batch
py -3.11 scripts/comfyui/generate-assets.py `
  --report build/copax-report.json `
  --variant copax `
  --ckpt copaxTimelessxlSDXL1_v12.safetensors `
  --prompt-style copax `
  --only "^sprites/planets/" `
  --limit 10 `
  --fit-vram `
  --max-render-dim 768 `
  --auto-alpha
```

### Full generation run

```powershell
py -3.11 scripts/comfyui/generate-assets.py `
  --report build/copax-report.json `
  --variant copax `
  --ckpt copaxTimelessxlSDXL1_v12.safetensors `
  --prompt-style copax `
  --fit-vram `
  --max-render-dim 768 `
  --auto-alpha
```

## Comparison with other checkpoints

| Checkpoint | Style | Best For | CFG | Steps |
|------------|-------|----------|-----|-------|
| Juggernaut XL | Realistic/Cinematic | Characters, scenes | 5-7 | 24-32 |
| Animagine XL | Anime/Manga | Stylized characters | 5-7 | 25-30 |
| Copax Timeless | Versatile/Timeless | Illustration, mixed styles | 5-7 | 30-50 |
| Pony Diffusion | Cartoon/Stylized | Vibrant characters | 5-7 | 24-32 |
| ProtoVision XL | 3D/Hyperreal | High-fidelity assets | 5-7 | 24-32 |

## Known quirks

1. **Open mouth tendency**: The model sometimes adds open mouths. Add `open mouth` to negative prompt.
2. **Older faces**: Can trend toward mature faces. Add `old face` to negative if unwanted.
3. **Long necks**: Occasionally produces elongated necks. Include in negative prompt.
4. **Background bleeding**: For transparent backgrounds, be explicit about `plain white background` and use `--auto-alpha` post-processing.

## Troubleshooting

- **OOM errors**: Use `--fit-vram` and reduce `--max-render-dim` to 768 or 512
- **Opaque background**: Use `--auto-alpha` flag for automatic background removal
- **Too realistic**: Reduce CFG to 4-5 or add `illustration, stylized` to positive prompt
- **Too soft/blurry**: Increase steps to 40+ or use `crisp, sharp focus` in prompt
