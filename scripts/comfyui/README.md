# Local ComfyUI (optional)

If you prefer, you can run ComfyUI from inside this repo so asset generation scripts
and workflows live together.

This does **not** vendor ComfyUI into git; it clones into `.comfyui/` which is gitignored.

## Setup

- `powershell -ExecutionPolicy Bypass -File scripts/comfyui/setup-comfyui-local.ps1`

This will:

- `git clone` ComfyUI into `.comfyui/ComfyUI`
- create `.comfyui/ComfyUI/.venv`
- install requirements

## Run

- `powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-comfyui-local.ps1`

If your Torch install has no CUDA support, the runner auto-falls back to `--cpu`.
You can also force CPU mode:

- `powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-comfyui-local.ps1 -Cpu`

Default URL:

- `http://127.0.0.1:8188`

## Models

Install your models under:

- `.comfyui/ComfyUI/models/checkpoints/`
- `.comfyui/ComfyUI/models/vae/`

Models are large and should stay out of git.

## Generating into variants (checkpoint comparison)

To compare checkpoints side-by-side, write outputs into per-checkpoint variant folders.

### Prompt style

The generator supports different prompt styles via `--prompt-style`:

- `juggernaut` (default): natural language prompts for Juggernaut XL and similar checkpoints
- `animagine`: tag-based prompts for Animagine XL 3.x checkpoints
- `pony`: tag-based prompts for Pony Diffusion v6 XL
- `protovision`: high-fidelity anime/hyperreal prompting for ProtoVision XL
- `sdxl`: neutral prompting for SDXL base checkpoints
- `copax`: timeless illustration prompting for Copax Timeless

Optional VAE override:

- `--vae <vae_file.safetensors>` (requires the workflow to include a `VAELoader`/`VAELoaderSimple` node)

### Quick checkpoint test (sample set)

Before generating all assets, run a quick test with one asset per category:

```powershell
# Generate just the test samples (see scripts/comfyui/checkpoint-test-sample.json)
py -3.11 scripts/comfyui/generate-assets.py --report build/<variant>-report.json --variant <variant> --ckpt <ckpt_file> --prompt-style <style> --fit-vram --auto-alpha --only "(astro-duck-base-front|astro-duck-happy-front|outfit-default-suit-front|texture-ocean|satellite-config|ring-cyan|atmosphere-normal|state-selected|glow-hover|badge-warning)"
```

Or use the generic runner:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-checkpoint-sample.ps1 -Variant <variant> -Checkpoint <ckpt_file> -PromptStyle <juggernaut|animagine|pony|protovision|sdxl|copax>

# Optional VAE override (if your workflow supports it)
powershell -ExecutionPolicy Bypass -File scripts/comfyui/run-checkpoint-sample.ps1 -Variant <variant> -Checkpoint <ckpt_file> -PromptStyle <...> -Vae sdxl_vae.safetensors
```

### Juggernaut XL

```powershell
py -3.11 scripts/comfyui/generate-assets.py --report build/juggernaut-report.json --variant juggernaut --prompt-style juggernaut --fit-vram --auto-alpha ...
```

### Animagine XL v3.1

Place the checkpoint file under `.comfyui/ComfyUI/models/checkpoints/`, then:

```powershell
py -3.11 scripts/comfyui/generate-assets.py --report build/animagine-report.json --variant animagine --ckpt animagineXLV31_v31.safetensors --prompt-style animagine --fit-vram --auto-alpha ...
```

Variant outputs land in:

- `assets/zelos_variants/<variant>/...`

The preview UI can switch variants via the Variant dropdown.

## Workflow file

Use the SDXL API workflow JSON described in:

- [scripts/comfyui/SDXL_WORKFLOW_ASSETGEN.md](scripts/comfyui/SDXL_WORKFLOW_ASSETGEN.md)

## Prompt packs (checkpoint-specific Zelos recipes)

- Juggernaut XL: `specs/mage/zelos-juggernaut-prompts.md`
- Animagine XL: `specs/mage/zelos-animagine-prompts.md`
- Pony Diffusion v6 XL: (uses `--prompt-style pony` presets in `scripts/comfyui/generate-assets.py`)
- ProtoVision XL: `specs/mage/zelos-protovision-prompts.md`
- SDXL base: `specs/mage/zelos-sdxl-prompts.md`
- Copax Timeless: `specs/mage/zelos-copax-prompts.md`

## Prompting guide (Juggernaut XL)

- [scripts/comfyui/JUGGERNAUT_XL_PROMPTING.md](scripts/comfyui/JUGGERNAUT_XL_PROMPTING.md)

## Prompting guide (Animagine XL)

- [scripts/comfyui/ANIMAGINE_XL_PROMPTING.md](scripts/comfyui/ANIMAGINE_XL_PROMPTING.md)

## Prompting guide (Pony Diffusion v6 XL)

- [scripts/comfyui/PONY_DIFFUSION_V6_XL_PROMPTING.md](scripts/comfyui/PONY_DIFFUSION_V6_XL_PROMPTING.md)

## Prompting guide template (future checkpoints)

- [scripts/comfyui/CHECKPOINT_PROMPTING_TEMPLATE.md](scripts/comfyui/CHECKPOINT_PROMPTING_TEMPLATE.md)

## Checkpoint list

- [scripts/comfyui/CHECKPOINTS.md](scripts/comfyui/CHECKPOINTS.md)
