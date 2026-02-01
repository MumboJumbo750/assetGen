import re

# Juggernaut XL (default)
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

STYLE_HEADER = JUGGERNAUT_STYLE_HEADER
NEGATIVE_PROMPT = JUGGERNAUT_NEGATIVE

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
