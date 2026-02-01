import argparse
import json
import os
import re
import time
import urllib.parse
import urllib.request
import uuid
from collections import deque


def _maybe_import_pil_image():
    try:
        from PIL import Image  # type: ignore

        return Image
    except Exception:  # noqa: BLE001
        return None


def _fit_size(width: int, height: int, max_dim: int) -> tuple[int, int]:
    if max_dim <= 0:
        return width, height
    if width <= max_dim and height <= max_dim:
        return width, height
    scale = min(max_dim / float(width), max_dim / float(height))
    new_w = max(64, int(round(width * scale)))
    new_h = max(64, int(round(height * scale)))
    # Keep SDXL-friendly multiples of 8.
    new_w = max(64, (new_w // 8) * 8)
    new_h = max(64, (new_h // 8) * 8)
    return new_w, new_h


def _rgb_close(a: tuple[int, int, int], b: tuple[int, int, int], tol: int) -> bool:
    return (
        abs(a[0] - b[0]) <= tol and abs(a[1] - b[1]) <= tol and abs(a[2] - b[2]) <= tol
    )


def _collect_edge_colors(image, samples_per_edge: int) -> list[tuple[int, int, int]]:
    # Collect representative RGB colors from the border to guess the background.
    width, height = image.size
    if width <= 1 or height <= 1:
        return []

    def _rgb_at(x: int, y: int) -> tuple[int, int, int]:
        r, g, b, _a = image.getpixel((x, y))
        return int(r), int(g), int(b)

    sample_points: list[tuple[int, int]] = [
        (0, 0),
        (width - 1, 0),
        (0, height - 1),
        (width - 1, height - 1),
    ]

    if samples_per_edge < 2:
        samples_per_edge = 2

    for index in range(samples_per_edge):
        x = int(round((width - 1) * (index / float(samples_per_edge - 1))))
        y = int(round((height - 1) * (index / float(samples_per_edge - 1))))
        sample_points.append((x, 0))
        sample_points.append((x, height - 1))
        sample_points.append((0, y))
        sample_points.append((width - 1, y))

    raw_colors = [_rgb_at(x, y) for (x, y) in sample_points]

    # Deduplicate/merge similar colors to keep the candidate list small.
    merged: list[tuple[int, int, int]] = []
    merge_tol = 12
    for color in raw_colors:
        if not any(_rgb_close(color, existing, merge_tol) for existing in merged):
            merged.append(color)
    return merged


def _apply_auto_alpha(image, tolerance: int, samples_per_edge: int) -> bool:
    """Make background transparent by flood-filling from the edges.

    Returns True if any pixels were made transparent.
    """

    width, height = image.size
    if width <= 2 or height <= 2:
        return False

    background_colors = _collect_edge_colors(image, samples_per_edge=samples_per_edge)
    if not background_colors:
        return False

    pixel_access = image.load()
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def _is_bg(x: int, y: int) -> bool:
        r, g, b, _a = pixel_access[x, y]
        rgb = (int(r), int(g), int(b))
        return any(_rgb_close(rgb, candidate, tolerance) for candidate in background_colors)

    # Seed queue with border pixels that look like background.
    for x in range(width):
        if _is_bg(x, 0):
            queue.append((x, 0))
        if _is_bg(x, height - 1):
            queue.append((x, height - 1))
    for y in range(height):
        if _is_bg(0, y):
            queue.append((0, y))
        if _is_bg(width - 1, y):
            queue.append((width - 1, y))

    made_transparent = 0

    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if visited[index]:
            continue
        visited[index] = 1

        if not _is_bg(x, y):
            continue

        r, g, b, _a = pixel_access[x, y]
        if _a != 0:
            pixel_access[x, y] = (int(r), int(g), int(b), 0)
            made_transparent += 1

        if x > 0:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y > 0:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))

    return made_transparent > 0


# ---------------------------------------------------------------------------
# Prompt style presets
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

# Animagine XL 3.x - tag-based style (put critical tags first)
ANIMAGINE_STYLE_HEADER = (
    # Follow the model card guidance: tag ordering + optional quality modifiers.
    # We keep it safe via rating: general (positive) + nsfw (negative).
    "rating: general, masterpiece, best quality, newest, "
    "cyberpunk, comic style, bold lineart, cel shading, high contrast, neon cyan, neon magenta, "
    "game asset, centered, isolated, simple background, white background"
)

ANIMAGINE_NEGATIVE = (
    # Start from the official recommended negative prompt, then add a few background-control terms.
    "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, "
    "worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, "
    "background scene, scenery, detailed background, clutter"
)

# ProtoVision XL (CivitAI) - high fidelity / 3D-ish anime-hyperreal look
PROTOVISION_STYLE_HEADER = (
    "Zelos V2, cyberpunk comic illustration, bold lineart, clean edges, sharp focus, "
    "cel shading with hard shadows, dramatic lighting, high contrast, neon cyan and magenta accents, "
    "game asset, centered, isolated, plain white background"
)

PROTOVISION_NEGATIVE = (
    "lowres, blurry, soft focus, out of focus, noisy, grainy, jpeg artifacts, watermark, logo, signature, text, "
    "background scene, scenery, detailed background, clutter, messy lineart, sketch, deformed, bad anatomy, extra limbs"
)

# SDXL base (official 1.0) - natural language style, minimal negative prompt
# Per official guidance: describe in detail, easy on negatives, easy on weights
SDXL_STYLE_HEADER = (
    "Zelos V2 game asset, cyberpunk comic illustration, bold outlines, cel shading with hard shadows, "
    "high contrast palette with neon cyan and magenta accents, centered composition, isolated subject, "
    "solid plain white background, dramatic lighting, high quality"
)

SDXL_NEGATIVE = (
    "lowres, blurry, noisy, grainy, jpeg artifacts, watermark, signature, text, "
    "background scenery, cluttered background, deformed, bad anatomy"
)

# Copax Timeless (CivitAI) - classic, slightly painterly/illustration vibe
COPAX_STYLE_HEADER = (
    "Zelos V2, cyberpunk comic illustration, bold lineart, crisp edges, dynamic shapes, cel shading, "
    "high contrast palette, neon cyan and magenta accents, game asset, centered, isolated, plain white background"
)

COPAX_NEGATIVE = (
    "lowres, blurry, noisy, grainy, jpeg artifacts, watermark, logo, signature, text, background scene, clutter, "
    "overly photorealistic, deformed, bad anatomy, extra limbs"
)

# Pony Diffusion v6 XL - supports both tags and natural language.
# Per model card: use full score_9..score_4_up string; clip skip 2 required; mostly no negative needed.
# Keep header concise: score tags + rating + source + minimal game-asset guidance.
PONY_STYLE_HEADER = (
    "score_9, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up, "
    "rating_safe, cyberpunk, comic style, bold lineart, cel shading, high contrast, neon colors, "
    "game asset, centered, isolated subject, simple white background"
)

# Model rarely needs negatives; keep minimal to block text/watermarks and force isolation.
PONY_NEGATIVE = (
    "nsfw, signature, watermark, logo, text, username, url, "
    "background scene, scenery, clutter"
)

# Active style pointers - set by --prompt-style argument
STYLE_HEADER = JUGGERNAUT_STYLE_HEADER
NEGATIVE_PROMPT = JUGGERNAUT_NEGATIVE
PROMPT_STYLE = "juggernaut"


def set_prompt_style(style: str) -> None:
    """Switch the global prompt style constants."""
    global STYLE_HEADER, NEGATIVE_PROMPT, PROMPT_STYLE
    if style == "animagine":
        STYLE_HEADER = ANIMAGINE_STYLE_HEADER
        NEGATIVE_PROMPT = ANIMAGINE_NEGATIVE
        PROMPT_STYLE = "animagine"
    elif style == "pony":
        STYLE_HEADER = PONY_STYLE_HEADER
        NEGATIVE_PROMPT = PONY_NEGATIVE
        PROMPT_STYLE = "pony"
    elif style == "protovision":
        STYLE_HEADER = PROTOVISION_STYLE_HEADER
        NEGATIVE_PROMPT = PROTOVISION_NEGATIVE
        PROMPT_STYLE = "protovision"
    elif style == "sdxl":
        STYLE_HEADER = SDXL_STYLE_HEADER
        NEGATIVE_PROMPT = SDXL_NEGATIVE
        PROMPT_STYLE = "sdxl"
    elif style == "copax":
        STYLE_HEADER = COPAX_STYLE_HEADER
        NEGATIVE_PROMPT = COPAX_NEGATIVE
        PROMPT_STYLE = "copax"
    else:  # juggernaut (default)
        STYLE_HEADER = JUGGERNAUT_STYLE_HEADER
        NEGATIVE_PROMPT = JUGGERNAUT_NEGATIVE
        PROMPT_STYLE = "juggernaut"

OUTFIT_DESCRIPTIONS = {
    "outfit-default-suit": "space suit overlay with cyan trim",
    "outfit-pirate": "tricorn hat, eye patch, small cape",
    "outfit-wizard": "starry hat, glowing cyan wand",
    "outfit-detective": "deerstalker hat, magnifying glass",
    "outfit-chef": "chef hat, apron, glowing spatula",
    "outfit-superhero": "cape, small mask",
    "outfit-scientist": "lab goggles, glowing beaker",
    "outfit-musician": "neon headphones, small synth",
    "outfit-explorer": "safari hat, binoculars",
    "outfit-ninja": "headband, throwing star",
    "outfit-royal": "crown, royal cape",
}


PLANET_TEXTURE_DESCRIPTIONS = {
    "solid": "simple smooth spherical planet, single base color with subtle shading",
    "gradient": "smooth spherical planet with a clean two-tone gradient band",
    "marble": "spherical planet with gentle marbling swirls, low-frequency pattern",
    "rocky": "spherical rocky planet with a few crater hints, simple surface noise",
    "gas-giant": "large spherical gas giant with soft horizontal bands",
    "ice": "icy spherical planet with pale blue tones and a few soft cracks",
    "lava": "lava spherical planet with glowing lava rivers and dark cooled crust",
    "ocean": "ocean spherical planet with a few simple continent shapes and a glossy highlight",
    "forest": "forest spherical planet with simple green land masses and subtle variation",
    "tech": "tech spherical planet with a few geometric panel lines and tiny glow accents",
}


def _http_json(url: str, payload: dict) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _http_get(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=60) as resp:
        return resp.read()


def _normalize_base_url(base_url: str) -> str:
    base_url = base_url.rstrip("/")
    if not base_url.startswith("http://") and not base_url.startswith("https://"):
        base_url = "http://" + base_url
    return base_url


def _set_workflow_text_inputs(workflow: dict, positive: str, negative: str) -> None:
    # Try to locate prompt text nodes. Support both:
    # - SD1.5/"simple" workflows: inputs.text
    # - SDXL workflows: inputs.text_g / inputs.text_l (CLIPTextEncodeSDXL)
    text_nodes = []
    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            continue
        if "text" in inputs and isinstance(inputs.get("text"), str):
            text_nodes.append((node_id, node, "text"))
        elif ("text_g" in inputs or "text_l" in inputs) and (
            isinstance(inputs.get("text_g", ""), str) or isinstance(inputs.get("text_l", ""), str)
        ):
            text_nodes.append((node_id, node, "sdxl"))

    if not text_nodes:
        return

    positives = []
    negatives = []
    for node_id, node, kind in text_nodes:
        meta = node.get("_meta") or {}
        title = (meta.get("title") or "").lower()
        if "neg" in title or "negative" in title:
            negatives.append((node_id, node, kind))
        else:
            positives.append((node_id, node, kind))

    def _apply(node: dict, kind: str, value: str) -> None:
        if kind == "text":
            node["inputs"]["text"] = value
        else:
            # SDXL: set both text_g and text_l to the same string unless you want to
            # separately control them.
            if "text_g" in node["inputs"]:
                node["inputs"]["text_g"] = value
            if "text_l" in node["inputs"]:
                node["inputs"]["text_l"] = value

    if positives:
        for _, node, kind in positives:
            _apply(node, kind, positive)
    if negatives:
        for _, node, kind in negatives:
            _apply(node, kind, negative)

    if not negatives and len(text_nodes) >= 2:
        # Assume 2-encoder layout: first positive, second negative.
        _apply(text_nodes[0][1], text_nodes[0][2], positive)
        _apply(text_nodes[1][1], text_nodes[1][2], negative)


def _set_workflow_size_inputs(workflow: dict, width: int, height: int) -> None:
    for _, node in workflow.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            continue
        # Common nodes: EmptyLatentImage, etc.
        if "width" in inputs and "height" in inputs:
            if isinstance(inputs.get("width"), int) and isinstance(inputs.get("height"), int):
                inputs["width"] = width
                inputs["height"] = height

        # SDXL text-encode nodes often carry target dimensions.
        if "target_width" in inputs and isinstance(inputs.get("target_width"), int):
            inputs["target_width"] = width
        if "target_height" in inputs and isinstance(inputs.get("target_height"), int):
            inputs["target_height"] = height
        if "crop_w" in inputs and isinstance(inputs.get("crop_w"), int):
            inputs["crop_w"] = 0
        if "crop_h" in inputs and isinstance(inputs.get("crop_h"), int):
            inputs["crop_h"] = 0


def _set_workflow_seed_inputs(workflow: dict, seed: int | None) -> None:
    if seed is None:
        return
    for _, node in workflow.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            continue
        if "seed" in inputs and isinstance(inputs.get("seed"), int):
            inputs["seed"] = seed


def _set_workflow_checkpoint_inputs(workflow: dict, ckpt_name: str | None) -> None:
    """Best-effort checkpoint override.

    Different workflows use different loader nodes/keys; we scan common input keys.
    """

    if not ckpt_name:
        return

    keys = ("ckpt_name", "checkpoint", "model_name")
    for _, node in workflow.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            continue
        for key in keys:
            if key in inputs and isinstance(inputs.get(key), str):
                inputs[key] = ckpt_name


def _set_workflow_vae_inputs(workflow: dict, vae_name: str | None) -> bool:
    """Best-effort VAE override.

    If the workflow contains a VAELoader-like node, this will:
    - set its `vae_name`
    - rewire VAEDecode nodes to use that VAE
    """

    if not vae_name:
        return False

    vae_loader_ids: list[str] = []

    for node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        class_type = node.get("class_type")
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            continue

        if class_type in ("VAELoader", "VAELoaderSimple") and "vae_name" in inputs:
            if isinstance(inputs.get("vae_name"), str):
                inputs["vae_name"] = vae_name
                vae_loader_ids.append(str(node_id))

    if not vae_loader_ids:
        return False

    vae_node_id = vae_loader_ids[0]

    for _node_id, node in workflow.items():
        if not isinstance(node, dict):
            continue
        if node.get("class_type") != "VAEDecode":
            continue
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            continue
        if "vae" in inputs and isinstance(inputs.get("vae"), list):
            inputs["vae"] = [vae_node_id, 0]

    return True


def _set_workflow_filename_prefix_inputs(workflow: dict, filename_prefix: str) -> None:
    # Ensure SaveImage nodes don't get fully cached across runs.
    # ComfyUI caching can result in an empty "outputs" block in /history for cached executions,
    # which breaks our ability to fetch an image by filename.
    for _, node in workflow.items():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            continue
        if "filename_prefix" in inputs and isinstance(inputs.get("filename_prefix"), str):
            inputs["filename_prefix"] = filename_prefix


def _first_output_image(history_entry: dict) -> dict | None:
    outputs = history_entry.get("outputs") or {}
    for _, out in outputs.items():
        images = out.get("images")
        if isinstance(images, list) and images:
            return images[0]
    return None


def _wait_for_history(base_url: str, prompt_id: str, timeout_s: int = 600) -> dict:
    deadline = time.time() + timeout_s
    history_url = f"{base_url}/history/{urllib.parse.quote(prompt_id)}"
    last_err = None

    while time.time() < deadline:
        try:
            raw = _http_get(history_url)
            history = json.loads(raw.decode("utf-8"))
            # ComfyUI returns {prompt_id: {...}}
            if prompt_id in history:
                return history[prompt_id]
        except Exception as e:  # noqa: BLE001
            last_err = e
        time.sleep(0.5)

    raise TimeoutError(f"Timed out waiting for ComfyUI history for prompt_id={prompt_id}. Last error={last_err}")


def build_prompts_for_rel_path(rel_path: str) -> tuple[str, str] | None:
    # Returns (positive, negative) or None if unknown.

    def _animagine_tags(*tags: str) -> str:
        # Animagine XL 3.x is not optimized for natural language; prefer short, comma-separated tags.
        clean = [t.strip() for t in tags if t and t.strip()]
        return ", ".join(clean)

    # Astro-duck base views
    match = re.fullmatch(
        r"sprites/astro-duck/base/astro-duck-base-(front|side|three-quarter)\.png", rel_path
    )
    if match:
        view = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "1animal",
                "duck",
                "astronaut",
                "mascot",
                "original character",
                "full body",
                f"{view} view",
                "minimal undersuit",
                "no outer suit",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. Astronaut duck mascot wearing a minimal undersuit (no outer suit), "
                "sleek proportions, smooth simple materials, bubble helmet optional and transparent, "
                f"full body, {view} view"
            )
        return positive, NEGATIVE_PROMPT

    if rel_path == "sprites/astro-duck/base/astro-duck-base-idle-sheet.png":
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "sprite sheet",
                "8 frames",
                "horizontal",
                "duck",
                "astronaut",
                "idle animation",
                "floating",
                "each frame 256x256",
                "aligned frames",
                "consistent spacing",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. 8-frame horizontal sprite sheet, astronaut duck in minimal undersuit, "
                "floating idle animation, each frame 256x256, total size 2048x256, consistent spacing, aligned frames"
            )
        return positive, NEGATIVE_PROMPT

    if rel_path == "sprites/astro-duck/base/astro-duck-base-fly-sheet.png":
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "sprite sheet",
                "6 frames",
                "horizontal",
                "duck",
                "astronaut",
                "flying animation",
                "jetpack",
                "each frame 256x256",
                "aligned frames",
                "consistent spacing",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. 6-frame horizontal sprite sheet, astronaut duck in minimal undersuit, "
                "jetpack flying animation, each frame 256x256, total size 1536x256, consistent spacing, aligned frames"
            )
        return positive, NEGATIVE_PROMPT

    # Expressions
    match = re.fullmatch(
        r"sprites/astro-duck/expressions/astro-duck-([a-z-]+)-(front|side|three-quarter)\.png",
        rel_path,
    )
    if match:
        expression = match.group(1)
        view = match.group(2)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "duck",
                "astronaut",
                "mascot",
                "face only",
                "overlay",
                "no body",
                f"{expression} expression",
                f"{view} view",
                "aligned",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. Astro-Duck face overlay only (no body), {expression} expression, "
                f"matches base head shape and eye placement, aligned to base face, {view} view"
            )
        return positive, NEGATIVE_PROMPT

    # Outfit overlays (per view)
    match = re.fullmatch(
        r"sprites/astro-duck/outfits/(outfit-[a-z-]+)-(front|side|three-quarter)\.png",
        rel_path,
    )
    if match:
        outfit_id = match.group(1)
        view = match.group(2)
        desc = OUTFIT_DESCRIPTIONS.get(outfit_id, outfit_id)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "duck",
                "astronaut",
                "outfit overlay",
                "costume pieces only",
                "no body",
                "no head redraw",
                desc,
                f"{view} view",
                "aligned",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. Astro-Duck outfit overlay only (costume pieces only), {desc}, "
                f"do not redraw body or head, aligned to base undersuit silhouette, {view} view"
            )
        return positive, NEGATIVE_PROMPT

    # Outfit idle/fly overlay sheets
    match = re.fullmatch(r"sprites/astro-duck/outfits/(outfit-[a-z-]+)-idle-sheet\.png", rel_path)
    if match:
        outfit_id = match.group(1)
        desc = OUTFIT_DESCRIPTIONS.get(outfit_id, outfit_id)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "sprite sheet",
                "8 frames",
                "horizontal",
                "outfit overlay",
                "costume pieces only",
                "no body",
                desc,
                "idle animation",
                "aligned frames",
                "each frame 256x256",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. 8-frame horizontal sprite sheet, Astro-Duck outfit overlay only (no body), {desc}, "
                "idle animation overlay aligned to base idle sheet, each frame 256x256, total size 2048x256, aligned frames"
            )
        return positive, NEGATIVE_PROMPT

    match = re.fullmatch(r"sprites/astro-duck/outfits/(outfit-[a-z-]+)-fly-sheet\.png", rel_path)
    if match:
        outfit_id = match.group(1)
        desc = OUTFIT_DESCRIPTIONS.get(outfit_id, outfit_id)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "sprite sheet",
                "6 frames",
                "horizontal",
                "outfit overlay",
                "costume pieces only",
                "no body",
                desc,
                "flying animation",
                "jetpack",
                "aligned frames",
                "each frame 256x256",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. 6-frame horizontal sprite sheet, Astro-Duck outfit overlay only (no body), {desc}, "
                "fly animation overlay aligned to base fly sheet, each frame 256x256, total size 1536x256, aligned frames"
            )
        return positive, NEGATIVE_PROMPT

    # Planets
    match = re.fullmatch(r"sprites/planets/texture-([a-z-]+)\.png", rel_path)
    if match:
        texture = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            texture_tag = texture.replace("-", " ")
            positive = _animagine_tags(
                STYLE_HEADER,
                "planet",
                "spherical",
                texture_tag,
                "clean silhouette",
                "terminator shadow",
                "specular highlight",
                "no rings",
                "no face",
            )
        else:
            texture_desc = PLANET_TEXTURE_DESCRIPTIONS.get(texture, texture)
            positive = (
                f"{STYLE_HEADER}. Stylized spherical planet icon, {texture_desc}, perfect round silhouette, "
                "3D shading with a clear terminator shadow, small specular highlight, no rings, no face, "
                "no characters, centered, isolated"
            )
        return positive, NEGATIVE_PROMPT

    match = re.fullmatch(r"sprites/planets/ring-([a-z-]+)\.png", rel_path)
    if match:
        ring = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "saturn rings",
                "overlay",
                "semi-transparent",
                ring,
                "no planet",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. Saturn-like rings overlay only ({ring}), semi-transparent, subtle gradient, "
                "no planet body, centered"
            )
        return positive, NEGATIVE_PROMPT

    match = re.fullmatch(r"sprites/planets/atmosphere-([a-z-]+)\.png", rel_path)
    if match:
        atmo = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "atmosphere halo",
                "overlay",
                "soft gradient",
                f"{atmo} thickness",
                "no planet",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. Atmosphere halo overlay only, soft gradient ring, {atmo} thickness, "
                "no planet body, centered"
            )
        return positive, NEGATIVE_PROMPT

    match = re.fullmatch(r"sprites/planets/state-([a-z-]+)\.png", rel_path)
    if match:
        state = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "planet state",
                "overlay",
                state,
                "neon glow",
                "ring",
                "no planet",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. Planet state overlay only ({state}), neon accent ring/glow, "
                "no planet body, centered"
            )
        return positive, NEGATIVE_PROMPT

    # Satellites
    match = re.fullmatch(r"sprites/satellites/satellite-([a-z-]+)\.png", rel_path)
    if match:
        icon = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "game UI icon",
                "satellite icon",
                icon,
                "simple shapes",
                "readable silhouette",
                "minimal shading",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. Satellite UI icon ({icon}), clean readable silhouette, minimal shading, neon cyan accent"
            )
        return positive, NEGATIVE_PROMPT

    match = re.fullmatch(r"sprites/satellites/state-([a-z-]+)\.png", rel_path)
    if match:
        state = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(STYLE_HEADER, "satellite state", "overlay", state, "ring", "glow")
        else:
            positive = f"{STYLE_HEADER}. Satellite state overlay ring/glow ({state}), centered"
        return positive, NEGATIVE_PROMPT

    match = re.fullmatch(r"sprites/satellites/glow-([a-z-]+)\.png", rel_path)
    if match:
        state = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(STYLE_HEADER, "neon halo", "overlay", state, "ring")
        else:
            positive = f"{STYLE_HEADER}. Soft neon halo ring overlay ({state}), centered"
        return positive, NEGATIVE_PROMPT

    match = re.fullmatch(r"sprites/satellites/badge-([a-z-]+)\.png", rel_path)
    if match:
        state = match.group(1)
        if PROMPT_STYLE in ("animagine", "pony"):
            positive = _animagine_tags(
                STYLE_HEADER,
                "badge",
                "overlay",
                state,
                "small",
                "corner",
            )
        else:
            positive = (
                f"{STYLE_HEADER}. Satellite badge overlay ({state}), small badge anchored to lower-right corner, centered canvas"
            )
        return positive, NEGATIVE_PROMPT

    # Backgrounds / UI / Effects / Icons can be added later.
    return None


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate missing assets by driving a running ComfyUI instance using the validator JSON report."
    )
    parser.add_argument(
        "--report",
        default="build/zelos-report.json",
        help="Validator JSON report path (created by scripts/validate-assets.py --report json)",
    )
    parser.add_argument(
        "--workflow",
        default=None,
        help=(
            "ComfyUI workflow JSON to submit (export one from ComfyUI: Save -> API Format). "
            "If omitted, defaults to the in-repo ComfyUI workflow path under .comfyui/ComfyUI."
        ),
    )
    parser.add_argument(
        "--comfy",
        default="http://127.0.0.1:8188",
        help="Base URL for the running ComfyUI server",
    )

    parser.add_argument(
        "--variant",
        default=None,
        help=(
            "Optional output variant name. Writes outputs under assets/zelos_variants/<variant>/... "
            "(e.g. juggernaut, animagine)."
        ),
    )
    parser.add_argument(
        "--output-root",
        default=None,
        help=(
            "Override the output root folder where rel_path assets will be written. "
            "Example: assets/zelos_variants/juggernaut"
        ),
    )
    parser.add_argument(
        "--ckpt",
        default=None,
        help=(
            "Optional ComfyUI checkpoint filename to force into the workflow (best-effort). "
            "Example: animagineXLV31_v31.safetensors"
        ),
    )
    parser.add_argument(
        "--vae",
        default=None,
        help=(
            "Optional ComfyUI VAE filename to force into the workflow (best-effort; requires a VAELoader node in the workflow). "
            "Example: sdxl_vae.safetensors"
        ),
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Limit number of assets to generate (0 = no limit)",
    )
    parser.add_argument(
        "--only",
        default=None,
        help="Optional regex filter for rel_path (generate only matching items)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be generated but do not call ComfyUI",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional fixed seed to force for all generations (useful for consistency)",
    )

    parser.add_argument(
        "--fit-vram",
        action="store_true",
        help=(
            "Render at a capped resolution to reduce VRAM use, then upscale to the requested output size. "
            "Requires Pillow (pip install pillow)."
        ),
    )
    parser.add_argument(
        "--max-render-dim",
        type=int,
        default=768,
        help="Max width/height used when --fit-vram is enabled (default: 768)",
    )

    parser.add_argument(
        "--auto-alpha",
        action="store_true",
        help=(
            "Attempt to make backgrounds transparent by flood-filling from the image edges. "
            "Works best for isolated subjects on a mostly-uniform background. Requires Pillow."
        ),
    )
    parser.add_argument(
        "--alpha-tolerance",
        type=int,
        default=24,
        help="Color tolerance (0-255) used by --auto-alpha (default: 24)",
    )
    parser.add_argument(
        "--alpha-samples",
        type=int,
        default=12,
        help="Number of samples per edge used to infer background colors for --auto-alpha (default: 12)",
    )
    parser.add_argument(
        "--timeout-s",
        type=int,
        default=1800,
        help="Max seconds to wait for a ComfyUI prompt to finish (default: 1800)",
    )
    parser.add_argument(
        "--prompt-style",
        default="juggernaut",
        choices=["juggernaut", "animagine", "pony", "protovision", "sdxl", "copax"],
        help=(
            "Prompt style to use. 'juggernaut' = natural language (default), "
            "'animagine' = tag-based for Animagine XL 3.x checkpoints, "
            "'pony' = tag-based for Pony Diffusion v6 XL, "
            "'protovision' = high-fidelity anime/hyperreal, "
            "'sdxl' = neutral SDXL base prompting, "
            "'copax' = timeless illustration prompting."
        ),
    )

    args = parser.parse_args()

    # Apply the chosen prompt style before building prompts
    set_prompt_style(args.prompt_style)

    repo_root = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
    workflow_default_name = "assetgen_sdxl_api.json"
    if args.prompt_style == "pony":
        workflow_default_name = "assetgen_sdxl_api_pony.json"

    # Prefer the tracked in-repo workflow JSONs.
    default_workflow = os.path.join(repo_root, "scripts", "comfyui", "workflows", workflow_default_name)

    # Back-compat: if user runs a local ComfyUI clone under .comfyui and has workflows there, allow it.
    comfyui_workflow = os.path.join(
        repo_root,
        ".comfyui",
        "ComfyUI",
        "user",
        "default",
        "workflows",
        workflow_default_name,
    )
    if not os.path.exists(default_workflow) and os.path.exists(comfyui_workflow):
        default_workflow = comfyui_workflow

    workflow_path = args.workflow or default_workflow
    if not os.path.exists(workflow_path):
        raise FileNotFoundError(
            "Workflow JSON not found. Either provide --workflow, or create the default at: "
            + default_workflow
        )

    base_url = _normalize_base_url(args.comfy)

    with open(args.report, "r", encoding="utf-8") as f:
        report = json.load(f)

    missing = report.get("missing") or []

    only_re = re.compile(args.only) if args.only else None

    # Some Windows tooling writes UTF-8 with BOM; json.load() will fail unless we use utf-8-sig.
    with open(workflow_path, "r", encoding="utf-8-sig") as f:
        workflow_base = json.load(f)

    if args.vae:
        applied = _set_workflow_vae_inputs(workflow_base, args.vae)
        if not applied:
            print(
                "WARN: --vae was provided but the workflow has no VAELoader node. "
                "Update your workflow to include VAELoader/VAELoaderSimple, or omit --vae to use the checkpoint VAE."
            )

    if args.variant and not args.output_root:
        args.output_root = os.path.join(repo_root, "assets", "zelos_variants", args.variant)

    output_root = args.output_root

    # Used to avoid ComfyUI cache hits across repeated runs.
    # This does not affect image content; it only influences output filenames.
    run_nonce = uuid.uuid4().hex[:8]

    count = 0
    for item in missing:
        rel_path = item.get("rel_path")
        full_path = item.get("full_path")
        expected_size = item.get("expected_size")

        if not rel_path:
            continue
        if only_re and not only_re.search(rel_path):
            continue
        if not expected_size or not isinstance(expected_size, list) or len(expected_size) != 2:
            print(f"SKIP (no expected_size): {rel_path}")
            continue

        width, height = int(expected_size[0]), int(expected_size[1])
        render_w, render_h = width, height
        if args.fit_vram:
            render_w, render_h = _fit_size(width, height, args.max_render_dim)

        prompts = build_prompts_for_rel_path(rel_path)
        if not prompts:
            print(f"SKIP (no prompt mapping yet): {rel_path}")
            continue

        positive, negative = prompts

        if args.dry_run:
            target_path = (
                os.path.normpath(os.path.join(output_root, rel_path))
                if output_root
                else os.path.normpath(full_path)
                if full_path
                else rel_path
            )
            print(f"WOULD GENERATE: {rel_path} ({width}x{height}) -> {target_path}")
            count += 1
            if args.limit and count >= args.limit:
                break
            continue

        workflow = json.loads(json.dumps(workflow_base))  # cheap deep copy
        _set_workflow_text_inputs(workflow, positive=positive, negative=negative)
        _set_workflow_size_inputs(workflow, width=render_w, height=render_h)
        _set_workflow_seed_inputs(workflow, seed=args.seed)
        _set_workflow_checkpoint_inputs(workflow, ckpt_name=args.ckpt)

        safe_stem = re.sub(r"[^a-zA-Z0-9_-]+", "_", os.path.splitext(os.path.basename(rel_path))[0])
        _set_workflow_filename_prefix_inputs(workflow, filename_prefix=f"assetgen_{run_nonce}_{safe_stem}")

        payload = {"prompt": workflow}
        res = _http_json(f"{base_url}/prompt", payload)
        prompt_id = res.get("prompt_id")
        if not prompt_id:
            raise RuntimeError(f"ComfyUI /prompt did not return prompt_id: {res}")

        hist = _wait_for_history(base_url, prompt_id, timeout_s=int(args.timeout_s))
        img = _first_output_image(hist)
        if not img:
            raise RuntimeError(f"No output image found in history for prompt_id={prompt_id}")

        filename = img.get("filename")
        subfolder = img.get("subfolder") or ""
        img_type = img.get("type") or "output"

        if not filename:
            raise RuntimeError(f"History image missing filename for prompt_id={prompt_id}: {img}")

        view_url = (
            f"{base_url}/view?filename={urllib.parse.quote(filename)}"
            f"&subfolder={urllib.parse.quote(subfolder)}&type={urllib.parse.quote(img_type)}"
        )
        img_bytes = _http_get(view_url)

        if output_root:
            out_path = os.path.normpath(os.path.join(output_root, rel_path))
        else:
            if not full_path:
                raise RuntimeError(
                    f"Report item missing full_path and no --output-root provided for rel_path={rel_path}"
                )
            out_path = os.path.normpath(full_path)
        os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)

        needs_pil = args.auto_alpha or (args.fit_vram and (render_w != width or render_h != height))
        if needs_pil:
            Image = _maybe_import_pil_image()
            if Image is None:
                raise RuntimeError(
                    "This operation requires Pillow. Install it with: python -m pip install pillow (use the same Python you run this script with)"
                )
            from io import BytesIO

            pil_image = Image.open(BytesIO(img_bytes)).convert("RGBA")

            auto_alpha_applied = False
            if args.auto_alpha:
                auto_alpha_applied = _apply_auto_alpha(
                    pil_image, tolerance=args.alpha_tolerance, samples_per_edge=args.alpha_samples
                )

            if args.fit_vram and (render_w != width or render_h != height):
                pil_image = pil_image.resize((width, height), resample=Image.Resampling.LANCZOS)

            pil_image.save(out_path, format="PNG")
        else:
            auto_alpha_applied = False
            with open(out_path, "wb") as f:
                f.write(img_bytes)

        info_bits = []
        if args.fit_vram and (render_w != width or render_h != height):
            info_bits.append(f"rendered {render_w}x{render_h} → upscaled {width}x{height}")
        if args.auto_alpha and auto_alpha_applied:
            info_bits.append("auto-alpha")
        if info_bits:
            print(f"WROTE: {rel_path} -> {out_path} ({', '.join(info_bits)})")
        else:
            print(f"WROTE: {rel_path} -> {out_path}")

        count += 1
        if args.limit and count >= args.limit:
            break

    print(f"Done. Generated: {count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
