import json
import urllib.request
import urllib.parse
import time
import uuid

def http_json(url: str, payload: dict) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))

def http_get(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=60) as resp:
        return resp.read()

def normalize_base_url(base_url: str) -> str:
    base_url = base_url.rstrip("/")
    if not base_url.startswith("http://") and not base_url.startswith("https://"):
        base_url = "http://" + base_url
    return base_url

def wait_for_history(base_url: str, prompt_id: str, timeout_s: int = 600) -> dict:
    deadline = time.time() + timeout_s
    history_url = f"{base_url}/history/{urllib.parse.quote(prompt_id)}"
    
    while time.time() < deadline:
        try:
            raw = http_get(history_url)
            history = json.loads(raw.decode("utf-8"))
            if prompt_id in history:
                return history[prompt_id]
        except Exception:
            pass
        time.sleep(0.5)
    
    raise TimeoutError(f"Timed out waiting for ComfyUI history for prompt_id={prompt_id}")

def get_first_output_image(history_entry: dict) -> dict | None:
    outputs = history_entry.get("outputs") or {}
    for _, out in outputs.items():
        images = out.get("images")
        if isinstance(images, list) and images:
            return images[0]
    return None

def set_workflow_inputs(workflow: dict, positive: str, negative: str, width: int, height: int, seed: int = None, ckpt_name: str = None):
    # Text Inputs
    for _, node in workflow.items():
        if not isinstance(node, dict): continue
        inputs = node.get("inputs")
        if not isinstance(inputs, dict): continue
        
        # SDXL Text
        if ("text_g" in inputs or "text_l" in inputs) and (isinstance(inputs.get("text_g"), str) or isinstance(inputs.get("text_l"), str)):
             meta = node.get("_meta") or {}
             title = (meta.get("title") or "").lower()
             is_neg = "neg" in title or "negative" in title
             val = negative if is_neg else positive
             if "text_g" in inputs: inputs["text_g"] = val
             if "text_l" in inputs: inputs["text_l"] = val
        
        # SD1.5 Text
        elif "text" in inputs and isinstance(inputs.get("text"), str):
             meta = node.get("_meta") or {}
             title = (meta.get("title") or "").lower()
             is_neg = "neg" in title or "negative" in title
             inputs["text"] = negative if is_neg else positive

        # Size
        if "width" in inputs and "height" in inputs and isinstance(inputs.get("width"), int):
            inputs["width"] = width
            inputs["height"] = height
            
        # Seed
        if seed is not None and "seed" in inputs and isinstance(inputs.get("seed"), int):
            inputs["seed"] = seed

        # Checkpoint
        if ckpt_name:
            if "ckpt_name" in inputs: inputs["ckpt_name"] = ckpt_name
            elif "checkpoint" in inputs: inputs["checkpoint"] = ckpt_name

    return workflow
