import os
import json
import random
from PIL import Image
from io import BytesIO
from . import comfy, prompts, stitcher

# Configuration
COMFY_URL = "http://127.0.0.1:8188"
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
OUTPUT_DIR = os.path.join(REPO_ROOT, "assets")

# Checkpoint-to-output-folder mapping
CHECKPOINT_OUTPUT_PATHS = {
    "juggernaut": "assets/zelos_variants/juggernaut",
    "animagine": "assets/zelos_variants/animagine",
    "pony": "assets/zelos_variants/pony",
    "protovision": "assets/zelos_variants/protovision",
    "copax": "assets/zelos_variants/copax",
    "sdxl": "assets/zelos_variants/sdxl",
    "default": "assets/zelos",
}

def generate_asset(rel_path: str, workflow_path: str, count: int = 1, config: dict = None):
    if not isinstance(rel_path, str) or not rel_path.strip():
        return {"status": "error", "error": "Missing or invalid rel_path"}

    normalized_rel_path = rel_path.strip().replace("\\", "/")
    normalized_rel_path = normalized_rel_path.lstrip("/")
    normalized_rel_path = normalized_rel_path.rstrip("/")

    base_name = os.path.basename(normalized_rel_path)
    if base_name in {"", ".", ".."}:
        return {"status": "error", "error": f"Invalid output path: {rel_path}"}

    # If the user provided a filename without extension (or ended with a dot), default to PNG.
    # This prevents PIL errors like: "unknown file extension: .".
    root_name, ext = os.path.splitext(base_name)
    if ext in {"", "."}:
        normalized_rel_path = normalized_rel_path.rstrip(".") + ".png"

    if config:
        checkpoint = config.get("checkpoint")
        prompts_dict = config.get("prompts", {})
        
        # Resolve positive prompt
        if checkpoint and checkpoint in prompts_dict:
            positive = prompts_dict[checkpoint]
        elif "default" in prompts_dict:
            positive = prompts_dict["default"]
        else:
            positive = config.get("prompt", "")
            
        negative_prompts = config.get("negative_prompts", {})
        negative = ""
        if isinstance(negative_prompts, dict) and checkpoint:
            negative = negative_prompts.get(checkpoint, "") or ""
        if not negative:
            negative = config.get("negative_prompt", "")
        seed = config.get("seed", random.randint(1, 999999999))
        
        # Determine output folder: prefer checkpoint-specific path if known checkpoint is selected
        if checkpoint and checkpoint in CHECKPOINT_OUTPUT_PATHS:
            abs_output_dir = os.path.join(REPO_ROOT, CHECKPOINT_OUTPUT_PATHS[checkpoint])
        else:
            abs_output_dir = os.path.join(REPO_ROOT, config.get("output_folder", "assets"))
    else:
        checkpoint = None
        positive, negative = prompts.get_prompts(rel_path)
        seed = random.randint(1, 999999999)
        # Default output dir
        abs_output_dir = OUTPUT_DIR
    
    print(f"Generating {rel_path} with ckpt={checkpoint}...")
    
    # Reload workflow for each run to be safe
    with open(workflow_path, "r", encoding="utf-8") as f:
        workflow_base = json.load(f)

    # Detect if sheet and get frame count
    is_sheet = "sheet" in rel_path
    frames_to_gen = 1
    if is_sheet:
        # Try to get frameCount from config's animation metadata
        if config and config.get("animation"):
            frames_to_gen = config["animation"].get("frameCount", 8)
        elif config and config.get("animationType"):
            # animationType references a type from the index's animationTypes
            # Fallback to defaults based on type name
            anim_type = config["animationType"]
            type_defaults = {
                "idle": 8, "fly": 6, "run": 8, "attack": 6,
                "hit": 4, "death": 6, "explode": 8, "thrust": 4,
                "bank-left": 4, "bank-right": 4, "shoot": 3,
                "defeat": 10, "jump-start": 4, "fall": 4, "land": 4,
                "crouch": 2, "climb": 6, "windup": 6, "phase": 8
            }
            frames_to_gen = type_defaults.get(anim_type, 8)
        else:
            # Fallback: infer from filename
            if "idle" in rel_path: frames_to_gen = 8
            elif "fly" in rel_path: frames_to_gen = 6
            elif "run" in rel_path: frames_to_gen = 8
            elif "attack" in rel_path: frames_to_gen = 6
            elif "explode" in rel_path: frames_to_gen = 8
            elif "death" in rel_path: frames_to_gen = 6
            elif "hit" in rel_path: frames_to_gen = 4
            else: frames_to_gen = 8  # Default for unknown sheets
    
    generated_images = []

    ckpt_override = None
    if config:
        candidate = config.get("checkpoint")
        if isinstance(candidate, str):
            c = candidate.lower().strip()
            if c.endswith((".safetensors", ".ckpt", ".pt", ".pth")):
                ckpt_override = candidate
        candidate = config.get("checkpoint_file")
        if not ckpt_override and isinstance(candidate, str):
            c = candidate.lower().strip()
            if c.endswith((".safetensors", ".ckpt", ".pt", ".pth")):
                ckpt_override = candidate
    
    # Get checkpoint-specific sampler settings
    sampler_settings = prompts.get_sampler_settings(ckpt_override or checkpoint or "")
    
    for i in range(frames_to_gen):
        print(f"  Frame {i+1}/{frames_to_gen}...")
        
        # Clone workflow
        workflow = json.loads(json.dumps(workflow_base))
        
        # Settings
        # Use provided seed or random
        current_seed = seed + i
        
        # Apply checkpoint-specific settings
        comfy.set_workflow_inputs(
            workflow, positive, negative, 512, 512,
            seed=current_seed,
            ckpt_name=ckpt_override,
            sampler_name=sampler_settings.get("sampler_name"),
            scheduler=sampler_settings.get("scheduler"),
            steps=sampler_settings.get("steps"),
            cfg=sampler_settings.get("cfg"),
        )
        
        # Dispatch
        try:
            res = comfy.http_json(f"{COMFY_URL}/prompt", {"prompt": workflow})
            prompt_id = res["prompt_id"]
            
            hist = comfy.wait_for_history(COMFY_URL, prompt_id)
            img_info = comfy.get_first_output_image(hist)
            if not img_info:
                raise Exception("No image returned")
                
            fname = img_info["filename"]
            img_bytes = comfy.http_get(f"{COMFY_URL}/view?filename={fname}")
            
            img = Image.open(BytesIO(img_bytes)).convert("RGBA")
            generated_images.append(img)
            
        except Exception as e:
            print(f"Error frame {i}: {e}")
            return {"status": "error", "error": str(e)}

    # Finalize
    final_img = None
    if is_sheet:
        final_img = stitcher.stitch_horizontal(generated_images)
    else:
        final_img = generated_images[0]
        
    # Save
    # Determine final output path.
    # When a checkpoint-specific output dir is used, extract just the filename
    # portion from the path to avoid nested "assets/..." issues.
    if checkpoint and checkpoint in CHECKPOINT_OUTPUT_PATHS:
        # Strip any leading folder structure, keep only the relative file path
        # e.g. "assets/free/myfile.png" -> "myfile.png"
        # or "sprites/duck.png" -> "sprites/duck.png"
        path_for_file = normalized_rel_path
        # Remove common prefixes that would cause nesting
        for prefix in ["assets/free/", "assets/zelos/", "assets/"]:
            if path_for_file.startswith(prefix):
                path_for_file = path_for_file[len(prefix):]
                break
        full_path = os.path.join(abs_output_dir, path_for_file)
    elif normalized_rel_path.startswith("assets/"):
        # UI specs typically store paths like "assets/...". In that case we want
        # to write relative to the repo root (so status checks work) rather than
        # ending up with "assets/assets/...".
        full_path = os.path.join(REPO_ROOT, normalized_rel_path)
    else:
        full_path = os.path.join(abs_output_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    # Force PNG so we don't depend on filename extension.
    final_img.save(full_path, format="PNG")
    print(f"Saved to {full_path}")
    
    return {"status": "success", "path": full_path}
