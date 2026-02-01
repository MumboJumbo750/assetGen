# Prompt Pack: Zelos V2 + SDXL Base 1.0

This prompt pack is tailored for the **official SDXL Base 1.0** checkpoint while keeping the **Zelos V2** asset requirements consistent.

Aligns with:
- `specs/zelos-asset-index.json`
- `scripts/comfyui/generate-assets.py`

---

## Key Findings from Official Sources

### From Stability AI GitHub & HuggingFace
- **Native resolution**: 1024×1024, but supports multiple aspect ratios (see below)
- **Text encoders**: Dual CLIP (OpenCLIP-ViT/G + CLIP-ViT/L) — understands natural language well
- **Prompt style**: Natural language descriptions work best (not tag-based like some anime models)
- **CFG scale**: 5–7 recommended (SDXL is sensitive; higher causes artifacts)
- **Sampling steps**: 20–40 typical (official demos use 20-30 for base, optional +10 for refiner)
- **Samplers**: Euler, Euler Ancestral, DPM++ 2M, DPMPP2SAncestral all work well
- **Negative prompts**: Keep minimal — only list things you actually want to avoid

### Supported Aspect Ratios (official)
| Ratio | Resolution   | Use Case              |
|-------|-------------|-----------------------|
| 1:1   | 1024×1024   | Default / square      |
| 3:2   | 1152×768    | Landscape             |
| 2:3   | 768×1152    | Portrait              |
| 16:9  | 1344×768    | Wide cinematic        |
| 9:16  | 768×1344    | Tall / mobile         |
| 4:3   | 1152×896    | Classic landscape     |
| 3:4   | 896×1152    | Classic portrait      |

For our GTX 1060 6GB, stick to **768×768** max per our `--max-render-dim 768` constraint.

---

## Goals
- Stable, neutral generations (baseline for A/B testing)
- Simple backgrounds for clean alpha extraction
- Natural language prompts that leverage SDXL's dual CLIP encoders

---

## SDXL Base Style Header

Use descriptive, natural language. SDXL understands context well.

```
Zelos V2 game asset, clean digital illustration, crisp outlines, simple flat shading, vibrant saturated colors with neon cyan accents, centered composition, isolated subject, solid plain white background, studio lighting, high quality
```

### Why this works
- "clean digital illustration" → tells SDXL the art style
- "crisp outlines, simple flat shading" → avoids painterly softness
- "solid plain white background" → critical for alpha extraction
- "studio lighting" → even illumination for game assets
- "high quality" → SDXL responds well to quality cues (but don't overdo it)

---

## Global Negative Prompt

Keep it minimal per official guidance. Only include what you actually want to avoid:

```
lowres, blurry, noisy, grainy, jpeg artifacts, watermark, signature, text, background scenery, cluttered background, deformed, bad anatomy
```

### Notes
- Don't pile on dozens of negative keywords — SDXL doesn't need it
- Avoid excessive weights like `(keyword:1.5)` — SDXL is sensitive; stay ≤1.3

---

## Recommended Settings

| Parameter     | Value                | Notes                                      |
|---------------|---------------------|--------------------------------------------|
| Steps         | 25–30               | Sweet spot for quality vs speed            |
| CFG Scale     | 5.5–7.0             | Lower than SD 1.5; 6.0 is safe default     |
| Sampler       | Euler or DPM++ 2M   | Both work well; Euler is faster            |
| Scheduler     | Karras              | Standard choice                            |
| Resolution    | 768×768             | Our VRAM-safe max (native is 1024×1024)    |
| VAE           | Built-in (VAE fix)  | Use `sdXL_v10VAEFix.safetensors`           |

---

## Asset-Type Prompt Patterns

### Characters (Astro-Duck)
```
[STYLE_HEADER], cute cartoon duck astronaut character, [POSE/VIEW], small orange beak, round body, [OUTFIT_DESC]
```
- Use specific pose words: "facing forward", "side view", "three-quarter view"
- Describe outfit items naturally, not as tags

### Props / Items
```
[STYLE_HEADER], [ITEM_DESC], clean icon style, floating, no shadow
```
- Keep descriptions simple and specific
- "floating, no shadow" helps isolation

### Planet Textures
```
[STYLE_HEADER], spherical planet, [TEXTURE_TYPE], cosmic object, deep space theme
```
- Describe surface: "rocky cratered surface", "swirling gas clouds", "icy crystalline"

### UI Elements
```
[STYLE_HEADER], game UI [ELEMENT_TYPE], rounded corners, glowing edge, flat design
```
- Specify shape and style clearly

---

## Automation Usage

```powershell
# Using the sample runner
.\scripts\comfyui\run-checkpoint-sample.ps1 `
    -Variant sdxl `
    -Checkpoint sdXL_v10VAEFix.safetensors `
    -PromptStyle sdxl

# Direct script usage
python scripts/comfyui/generate-assets.py `
    --prompt-style sdxl `
    --ckpt sdXL_v10VAEFix.safetensors `
    --steps 28 `
    --cfg 6.0
```

**Variant output folder**: `assets/zelos_variants/sdxl/...`

---

## Workflow Notes

### No Workflow Changes Needed
The existing SDXL workflow (`scripts/comfyui/workflow-sdxl-api.json`) is already compatible with SDXL Base 1.0:
- Uses `CLIPTextEncodeSDXL` with dual text encoder outputs ✓
- KSampler with standard Euler/Karras ✓
- VAEDecode → SaveImage pipeline ✓

### Refiner (Optional)
SDXL has an optional refiner model for extra detail. For game assets, the base model alone is usually sufficient. If you want to experiment:
1. Download `sd_xl_refiner_1.0.safetensors`
2. Chain base → refiner with denoising_start=0.8 on refiner
3. This adds latency; skip for batch asset generation

---

## Quality Tips

1. **Be descriptive, not tag-dumpy** — "a cute cartoon duck wearing a space helmet, facing forward" beats "duck, space, helmet, front, cute"

2. **Keyword weights** — Use sparingly; `(keyword:1.2)` max. SDXL is more sensitive than SD 1.5.

3. **Background control** — Always mention "plain white background" or "solid color background" explicitly.

4. **Composition** — "centered", "isolated subject", "no other objects" help keep assets clean.

5. **Avoid** — Don't ask for legible text (SDXL struggles with it).
