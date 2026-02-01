import os
import json
import random
from PIL import Image
from io import BytesIO
from . import comfy, prompts, stitcher

# Configuration
COMFY_URL = "http://127.0.0.1:8188"
OUTPUT_DIR = "c:/projects/assetsGen/assets"

def generate_asset(rel_path: str, workflow_path: str, count: int = 1):
    positive, negative = prompts.get_prompts(rel_path)
    
    print(f"Generating {rel_path}...")
    
    # Reload workflow for each run to be safe
    with open(workflow_path, "r", encoding="utf-8") as f:
        workflow_base = json.load(f)

    # Detect if sheet
    is_sheet = "sheet" in rel_path
    frames_to_gen = 1
    if is_sheet:
        if "idle" in rel_path: frames_to_gen = 8
        elif "fly" in rel_path: frames_to_gen = 6
    
    generated_images = []
    
    for i in range(frames_to_gen):
        print(f"  Frame {i+1}/{frames_to_gen}...")
        
        # Clone workflow
        workflow = json.loads(json.dumps(workflow_base))
        
        # Settings
        seed = random.randint(1, 999999999)
        comfy.set_workflow_inputs(workflow, positive, negative, 512, 512, seed=seed)
        
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
    full_path = os.path.join(OUTPUT_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    final_img.save(full_path)
    print(f"Saved to {full_path}")
    
    return {"status": "success", "path": full_path}
