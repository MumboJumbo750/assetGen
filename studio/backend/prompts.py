import re

# ---------------------------------------------------------------------------
# Checkpoint-specific style presets
# ---------------------------------------------------------------------------

# Juggernaut XL (default) - natural language style
JUGGERNAUT_STYLE_HEADER = (
    "Zelos V2 cyberpunk comic style, bold lineart, consistent line weight, cel shading with hard shadows, "
    "high contrast palette, neon cyan and magenta accents, dramatic lighting, "
    "clean edges, game asset, centered, isolated subject, transparent background"
)
JUGGERNAUT_NEGATIVE = (
    "photorealistic, realistic skin, 3d render, pixel art, lowres, blurry, noisy, grainy, jpeg artifacts, "
    "watermark, logo, signature, text, typography, background scene, clutter, messy lineart, sketch, "
    "deformed, bad anatomy, extra limbs, face, eyes, mouth, character, mascot, animal"
)

# Animagine XL 3.x - tag-based style
ANIMAGINE_STYLE_HEADER = (
    "rating: general, masterpiece, best quality, newest, "
    "cyberpunk, comic style, bold lineart, cel shading, high contrast, neon cyan, neon magenta, "
    "game asset, centered, isolated, simple background, white background"
)
ANIMAGINE_NEGATIVE = (
    "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, "
    "worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, "
    "background scene, scenery, detailed background, clutter"
)

# Copax Timeless (SDXL) - versatile illustration style
# Ref: https://civitai.com/models/118111/copax-timeless
# Recommended: Steps 30-50, CFG 5-7, Sampler dpmpp_3m_sde/euler_a, Scheduler exponential/karras
COPAX_STYLE_HEADER = (
    "Zelos V2, cyberpunk illustration, bold lineart, crisp edges, elegant shapes, "
    "cel shading with soft gradients, high contrast palette, neon cyan and magenta accents, "
    "dramatic lighting, game asset, centered, isolated, plain white background"
)
COPAX_NEGATIVE = (
    "(worst quality, low quality), photorealistic, realistic skin, 3d render, "
    "lowres, blurry, noisy, grainy, jpeg artifacts, watermark, logo, signature, text, "
    "background scene, scenery, clutter, deformed, bad anatomy, extra limbs, "
    "open mouth, ugly face, old face, long neck"
)

# Pony Diffusion v6 XL - score-based prompting
PONY_STYLE_HEADER = (
    "score_9, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up, "
    "rating_safe, cyberpunk, comic style, bold lineart, cel shading, high contrast, neon colors, "
    "game asset, centered, isolated subject, simple white background"
)
PONY_NEGATIVE = (
    "nsfw, signature, watermark, logo, text, username, url, "
    "background scene, scenery, clutter"
)

# ProtoVision XL - high fidelity 3D/anime look
PROTOVISION_STYLE_HEADER = (
    "Zelos V2, cyberpunk comic illustration, bold lineart, clean edges, sharp focus, "
    "cel shading with hard shadows, dramatic lighting, high contrast, neon cyan and magenta accents, "
    "game asset, centered, isolated, plain white background"
)
PROTOVISION_NEGATIVE = (
    "lowres, blurry, soft focus, out of focus, noisy, grainy, jpeg artifacts, watermark, logo, signature, text, "
    "background scene, scenery, detailed background, clutter, messy lineart, sketch, deformed, bad anatomy, extra limbs"
)

# SDXL base - minimal negative prompt
SDXL_STYLE_HEADER = (
    "Zelos V2 game asset, cyberpunk comic illustration, bold outlines, cel shading with hard shadows, "
    "high contrast palette with neon cyan and magenta accents, centered composition, isolated subject, "
    "solid plain white background, dramatic lighting, high quality"
)
SDXL_NEGATIVE = (
    "lowres, blurry, noisy, grainy, jpeg artifacts, watermark, signature, text, "
    "background scenery, cluttered background, deformed, bad anatomy"
)

# Checkpoint presets registry
CHECKPOINT_PRESETS = {
    "juggernaut": {"header": JUGGERNAUT_STYLE_HEADER, "negative": JUGGERNAUT_NEGATIVE},
    "animagine": {"header": ANIMAGINE_STYLE_HEADER, "negative": ANIMAGINE_NEGATIVE},
    "copax": {"header": COPAX_STYLE_HEADER, "negative": COPAX_NEGATIVE},
    "pony": {"header": PONY_STYLE_HEADER, "negative": PONY_NEGATIVE},
    "protovision": {"header": PROTOVISION_STYLE_HEADER, "negative": PROTOVISION_NEGATIVE},
    "sdxl": {"header": SDXL_STYLE_HEADER, "negative": SDXL_NEGATIVE},
}

# Checkpoint-specific sampler settings
# Format: { sampler_name, scheduler, steps, cfg }
CHECKPOINT_SAMPLER_SETTINGS = {
    "juggernaut": {"sampler_name": "euler", "scheduler": "karras", "steps": 28, "cfg": 7.0},
    "animagine": {"sampler_name": "euler_ancestral", "scheduler": "normal", "steps": 28, "cfg": 6.0},
    "pony": {"sampler_name": "euler_ancestral", "scheduler": "karras", "steps": 25, "cfg": 7.0},
    "protovision": {"sampler_name": "euler", "scheduler": "karras", "steps": 28, "cfg": 6.0},
    "sdxl": {"sampler_name": "euler", "scheduler": "normal", "steps": 28, "cfg": 7.0},
    # Copax Timeless: model recommends dpmpp_3m_sde + exponential, steps 30-50, cfg 5-7
    "copax": {"sampler_name": "dpmpp_3m_sde", "scheduler": "exponential", "steps": 35, "cfg": 6.0},
}

# Active style pointers
STYLE_HEADER = JUGGERNAUT_STYLE_HEADER
NEGATIVE_PROMPT = JUGGERNAUT_NEGATIVE
CURRENT_CHECKPOINT = "juggernaut"


def set_checkpoint_style(checkpoint: str) -> None:
    """Switch the global prompt style based on checkpoint name."""
    global STYLE_HEADER, NEGATIVE_PROMPT, CURRENT_CHECKPOINT
    
    # Normalize checkpoint name (extract base name, handle common variants)
    ckpt_lower = (checkpoint or "").lower()
    
    # Map checkpoint filenames to presets
    if "animagine" in ckpt_lower:
        preset = "animagine"
    elif "copax" in ckpt_lower or "timeless" in ckpt_lower:
        preset = "copax"
    elif "pony" in ckpt_lower:
        preset = "pony"
    elif "protovision" in ckpt_lower:
        preset = "protovision"
    elif "juggernaut" in ckpt_lower:
        preset = "juggernaut"
    elif checkpoint in CHECKPOINT_PRESETS:
        preset = checkpoint
    else:
        preset = "juggernaut"  # default
    
    if preset in CHECKPOINT_PRESETS:
        STYLE_HEADER = CHECKPOINT_PRESETS[preset]["header"]
        NEGATIVE_PROMPT = CHECKPOINT_PRESETS[preset]["negative"]
        CURRENT_CHECKPOINT = preset


def get_checkpoint_presets() -> dict:
    """Return all available checkpoint presets for the frontend."""
    return {
        name: {
            "header": preset["header"],
            "negative": preset["negative"],
            "sampler": CHECKPOINT_SAMPLER_SETTINGS.get(name, {}),
        }
        for name, preset in CHECKPOINT_PRESETS.items()
    }


def get_sampler_settings(checkpoint: str) -> dict:
    """Get recommended sampler settings for a checkpoint."""
    ckpt_lower = (checkpoint or "").lower()
    
    # Map checkpoint filenames to presets
    if "animagine" in ckpt_lower:
        preset = "animagine"
    elif "copax" in ckpt_lower or "timeless" in ckpt_lower:
        preset = "copax"
    elif "pony" in ckpt_lower:
        preset = "pony"
    elif "protovision" in ckpt_lower:
        preset = "protovision"
    elif "juggernaut" in ckpt_lower:
        preset = "juggernaut"
    elif checkpoint in CHECKPOINT_SAMPLER_SETTINGS:
        preset = checkpoint
    else:
        preset = "juggernaut"
    
    return CHECKPOINT_SAMPLER_SETTINGS.get(preset, CHECKPOINT_SAMPLER_SETTINGS["juggernaut"])


OUTFIT_DESCRIPTIONS = {
    "outfit-default-suit": "space suit overlay with cyan trim",
    "outfit-pirate": "tricorn hat, eye patch, small cape",
    "outfit-wizard": "starry hat, glowing cyan wand",
    # ... (add others as needed)
}

def get_prompts(rel_path: str):
    # Simplified port of the regex logic
    
    # Astro-duck base
    match = re.search(r"astro-duck-base-(front|side|three-quarter)\.png", rel_path)
    if match:
        view = match.group(1)
        return (f"{STYLE_HEADER}. Astronaut duck mascot, minimal undersuit, {view} view", NEGATIVE_PROMPT)

    # Sprite Sheets (Now returning SINGLE FRAME prompt)
    if "idle-sheet" in rel_path:
        return (f"{STYLE_HEADER}. Astronaut duck, idle pose, floating", NEGATIVE_PROMPT)

    if "fly-sheet" in rel_path:
        return (f"{STYLE_HEADER}. Astronaut duck, jetpack flying", NEGATIVE_PROMPT)

    return (f"{STYLE_HEADER}. Game asset", NEGATIVE_PROMPT)
