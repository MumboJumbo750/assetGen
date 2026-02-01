import os
import json
import glob
import uuid

class SpecManager:
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.specs_dir = os.path.join(root_dir, "specs")
        self.assets_dir = os.path.join(root_dir, "assets")
        self.ensure_dirs()

    def ensure_dirs(self):
        os.makedirs(self.specs_dir, exist_ok=True)
        os.makedirs(self.assets_dir, exist_ok=True)

    def list_specs(self):
        specs = []
        if not os.path.exists(self.specs_dir):
            return specs
            
        # Use recursive glob to find specs in subdirectories (like specs/zelos/)
        search_pattern = os.path.join(self.specs_dir, "**", "*.json")
        for file in glob.glob(search_pattern, recursive=True):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    spec = json.load(f)
                    # Add status check
                    spec['status'] = self.check_status(spec)
                    specs.append(spec)
            except Exception as e:
                print(f"Error loading spec {file}: {e}")
        return specs

    def save_spec(self, data):
        if not data.get('id'):
            data['id'] = str(uuid.uuid4())
        
        filename = f"{data['id']}.json"
        filepath = os.path.join(self.specs_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
        return data

    def check_status(self, spec):
        # Check if asset exists at targeted path
        if not spec.get('path'):
            return "planned"
            
        full_path = os.path.join(self.root_dir, spec['path'])
        if os.path.exists(full_path):
            return "generated"
        return "planned"

    def get_checkpoints(self):
        # List of models supported and documented in scripts/comfyui/
        return [
            "juggernautXL_v9.safetensors",
            "animagineXLV31_v31.safetensors",
            "ponyDiffusionV6XL_v6StartWithThisOne.safetensors",
            "protovisionXL_v60.safetensors",
            "copaxTimelessXL_v10.safetensors",
            "sd_xl_base_1.0.safetensors",
            "sd_xl_refiner_1.0.safetensors"
        ]
