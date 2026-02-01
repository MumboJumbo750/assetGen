import json
import os
import sys
import re
import itertools

import importlib.util

# Setup path to import generate-assets
current_dir = os.path.dirname(os.path.abspath(__file__))
repo_root = os.path.dirname(current_dir)
script_path = os.path.join(repo_root, "scripts", "comfyui", "generate-assets.py")

spec = importlib.util.spec_from_file_location("generate_assets", script_path)
generate_assets = importlib.util.module_from_spec(spec)
sys.modules["generate_assets"] = generate_assets
spec.loader.exec_module(generate_assets)

def load_index(index_path):
    with open(index_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def expand_pattern(pattern, vars_def, lists_def):
    # Find all {var} in pattern
    # Expand recursively
    
    # Simple regex to find {name}
    var_matches = re.findall(r'\{([a-zA-Z0-9_]+)\}', pattern)
    if not var_matches:
        return [pattern]

    # Build lists of values for each var
    var_values = []
    for var in var_matches:
        list_key = vars_def.get(var)
        if not list_key:
             # If var is not in vars_def, maybe it's a direct list in lists?
             # The index format says: "vars": { "view": "viewFiles" }
             # So we look up "viewFiles" in "lists"
             print(f"Warning: var {var} not found in vars definitions")
             return []
        
        values = lists_def.get(list_key)
        if not values:
            print(f"Warning: list {list_key} not found in lists definitions")
            return []
        var_values.append(values)

    # Cartesian product
    expanded_paths = []
    for combination in itertools.product(*var_values):
        path = pattern
        for i, var in enumerate(var_matches):
            path = path.replace(f'{{{var}}}', combination[i])
        expanded_paths.append(path)
    
    return expanded_paths

def main():
    index_path = os.path.join(repo_root, "specs", "zelos-asset-index.json")
    if not os.path.exists(index_path):
        print("Index file not found!")
        return

    index_data = load_index(index_path)
    root_path = index_data.get("root", "assets/zelos")
    lists = index_data.get("lists", {})
    entries = index_data.get("entries", [])
    
    styles = ["juggernaut", "animagine", "pony", "protovision", "sdxl", "copax"]
    
    specs_dir = os.path.join(repo_root, "specs")

    created_count = 0

    for entry in entries:
        kind = entry.get("type")
        files_to_process = []
        
        if kind == "file":
             files_to_process.append(entry.get("path"))
        elif kind == "pattern":
             pattern = entry.get("pattern")
             entry_vars = entry.get("vars", {})
             files_to_process.extend(expand_pattern(pattern, entry_vars, lists))
        
        for rel_path in files_to_process:
            # Construct full relative path (prepend root if needed?)
            # The index defines paths like "sprites/..."
            # The python script regexes match "sprites/..."
            # So we pass "sprites/..." to generate_assets
            
            # However, the spec file `path` usually implies `assets/...` or relative to repo?
            # Existing import used "assets/..."
            # Let's ensure consistency. `zelos-asset-index.json` says "root": "assets/zelos".
            # So actual file path is `assets/zelos/sprites/...`
            
            full_rel_path = f"{root_path}/{rel_path}"
            
            # Generate UUID or deterministic ID for the spec filename?
            # Or just hash the path.
            # Importer used uuid. Let's use name-based UUID?
            # Or just name matching the file?
            # Spec format: specs/assets/zelos/... .json?
            # The SpecManager loads from specs/ directory recursively.
            # So we can mirror the folder structure inside specs/.
            
            spec_rel_path = os.path.splitext(full_rel_path)[0] + ".json"
            spec_abs_path = os.path.join(specs_dir, full_rel_path.replace("assets/", "")) # Strip assets/ prefix if sticking to specs/ path convention?
            # Actually Step 226 showed `specs/assets/...` isn't quite right.
            # Step 226 showed `specs/14-visual-assets.md` and random JSON filenames.
            # Wait, Step 226 showed `specs/EMBEDDING_TEMPLATE.md` and many GUID.json files.
            # AND `specs/astro-duck-idle.md`.
            # If I want to be clean, I should name json files by their content or path.
            # Let's mirror the path: `specs/zelos/sprites/...`
            
            # Adjust spec path: `specs/zelos/sprites/foo.json`
            spec_file_path = os.path.join(specs_dir, "zelos", rel_path)
            # Remove extension .png and add .json
            spec_file_path = os.path.splitext(spec_file_path)[0] + ".json"
            
            os.makedirs(os.path.dirname(spec_file_path), exist_ok=True)
            
            # Generate Prompts
            prompts_dict = {}
            neg_prompt = ""
            
            for style in styles:
                generate_assets.set_prompt_style(style)
                # build_prompts_for_rel_path expects the path as seen in the regexes
                # The regexes look like "sprites/astro-duck/..."
                # So we pass `rel_path` (e.g. "sprites/astro-duck/...")
                
                res = generate_assets.build_prompts_for_rel_path(rel_path)
                if res:
                    pos, neg = res
                    prompts_dict[style] = pos
                    if style == "juggernaut":
                        neg_prompt = neg
                        prompts_dict["default"] = pos # Set default to Juggernaut
            
            if not prompts_dict:
                # No prompt found? Skip or log?
                # print(f"Skipping {rel_path} - no prompt match")
                continue
                
            # Create Spec Object
            spec_data = {
                "id": str(uuid.uuid5(uuid.NAMESPACE_URL, full_rel_path)),
                "name": os.path.basename(os.path.splitext(rel_path)[0]),
                "path": full_rel_path,
                "type": "image",
                "params": {
                    "prompts": prompts_dict,
                    "negative_prompt": neg_prompt,
                    # We could add more like seed, etc.
                },
                "status": "planned"
            }
            
            # Write JSON
            with open(spec_file_path, 'w', encoding='utf-8') as f:
                json.dump(spec_data, f, indent=2)
            
            created_count += 1

    print(f"Created {created_count} specs.")

if __name__ == "__main__":
    import uuid
    main()
