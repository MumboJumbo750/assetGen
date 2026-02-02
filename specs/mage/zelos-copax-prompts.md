# Prompt Pack: Zelos V2 + Copax Timeless (SDXL)

This prompt pack is tailored for **Copax Timeless** (SDXL XIV/V12+) while keeping the **Zelos V2** asset requirements consistent.

Aligns with:
- `database/specs/zelos-asset-index.json`
- `scripts/comfyui/generate-assets.py`

Reference docs:
- [CivitAI: Copax Timeless](https://civitai.com/models/118111/copax-timeless?modelVersionId=1108377)
- [COPAX_TIMELESS_PROMPTING.md](../../scripts/comfyui/COPAX_TIMELESS_PROMPTING.md)

## Goals
- Versatile illustration style that can handle multiple aesthetics
- Crisp lineart with elegant shapes
- Clean enough for sprites and UI
- Simple background for clean alpha extraction

## Copax style header

```
Zelos V2, cyberpunk illustration, bold lineart, crisp edges, elegant shapes,
cel shading with soft gradients, high contrast palette, neon cyan and magenta accents,
dramatic lighting, game asset, centered, isolated, plain white background
```

## Global negative prompt

```
(worst quality, low quality), photorealistic, realistic skin, 3d render,
lowres, blurry, noisy, grainy, jpeg artifacts, watermark, logo, signature, text,
background scene, scenery, clutter, deformed, bad anatomy, extra limbs,
open mouth, ugly face, old face, long neck
```

## Starting settings

| Setting | Recommended | Notes |
|---------|-------------|-------|
| Steps | 30–50 | Start with 35 |
| CFG | 5–7 | Lower = softer, Higher = sharper |
| Sampler | `dpmpp_3m_sde` | Also works: `euler_ancestral`, `euler` |
| Scheduler | `exponential` | Also works: `karras` |

## Automation usage

```powershell
# Generate with Copax-specific settings
py -3.11 scripts/comfyui/generate-assets.py `
  --report build/copax-report.json `
  --variant copax `
  --ckpt copaxTimelessxlSDXL1_v12.safetensors `
  --prompt-style copax `
  --fit-vram `
  --max-render-dim 768 `
  --auto-alpha
```

- `--prompt-style copax` applies optimal prompts and sampler settings
- Variant output folder: `assets/zelos_variants/copax/...`

## Asset-specific recipes

### Planets

**Positive:**
```
stylized planet, spherical, front view, centered, clean illustration,
crisp edges, simple shading, subtle terminator shadow, small highlights,
neon rim light, game asset, isolated, plain white background
```

### Astro-duck expressions

**Positive:**
```
cute astronaut duck mascot, head and shoulders, <EXPRESSION>, <VIEW>,
clean illustration, crisp lineart, cel shading, cyan trim on space suit,
simple shapes, game asset, centered, isolated, plain white background
```

### UI icons

**Positive:**
```
game UI icon, <SUBJECT>, simple shapes, clean illustration, crisp lineart,
minimal shading, flat colors, high contrast, neon accents,
centered, isolated, plain white background
```

## Known quirks

1. **Open mouth tendency**: Add `open mouth` to negative prompt
2. **Older faces**: Add `old face` to negative if unwanted
3. **Long necks**: Include `long neck` in negative prompt
4. **Background bleeding**: Use `--auto-alpha` for transparent backgrounds

