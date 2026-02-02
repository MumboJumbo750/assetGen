import os
import json
import glob

def migrate_specs(root_dir):
    specs_dir = os.path.join(root_dir, "database", "specs")
    search_pattern = os.path.join(specs_dir, "**", "*.json")
    
    updated_count = 0
    
    for filepath in glob.glob(search_pattern, recursive=True):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                spec = json.load(f)
            
            # Skip if it's a character sheet or something special for now 
            # or just add defaults
            
            rel_path = spec.get("path", "")
            if not rel_path: continue
            
            path_parts = rel_path.split("/")
            
            domain = spec.get("domain", "cosmic")
            kit = spec.get("kit", "standalone")
            role = spec.get("role", "image")
            
            changed = False
            
            if len(path_parts) >= 3:
                category = path_parts[2]
                
                if category == "sprites" and len(path_parts) >= 4:
                    kit_name = path_parts[3]
                    if kit_name == "astro-duck":
                        new_kit = "astroDuck"
                        if "base" in rel_path: new_role = "base"
                        elif "outfits" in rel_path: new_role = "outfit"
                        elif "expressions" in rel_path: new_role = "expression"
                        elif "poses" in rel_path: new_role = "pose"
                        else: new_role = "image"
                    elif kit_name == "planets":
                        new_kit = "planet"
                        if "texture" in rel_path: new_role = "texture"
                        elif "atmosphere" in rel_path: new_role = "atmosphere"
                        elif "ring" in rel_path: new_role = "ring"
                        elif "state" in rel_path: new_role = "state"
                        else: new_role = "image"
                    elif kit_name == "satellites":
                        new_kit = "satellite"
                        if "glow" in rel_path: new_role = "glow"
                        elif "badge" in rel_path: new_role = "badge"
                        elif "state" in rel_path: new_role = "state"
                        else: new_role = "icon"
                    else:
                        new_kit = "standalone"
                        new_role = "image"
                elif category == "backgrounds":
                    new_kit = "background"
                    new_role = "layer"
                elif category == "ui":
                    domain = "ui"
                    new_kit = "ui"
                    new_role = "component"
                else:
                    new_kit = "standalone"
                    new_role = "image"
                
                if spec.get("domain") != domain:
                    spec["domain"] = domain
                    changed = True
                if spec.get("kit") != new_kit:
                    spec["kit"] = new_kit
                    changed = True
                if spec.get("role") != new_role:
                    spec["role"] = new_role
                    changed = True

            if changed:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(spec, f, indent=2)
                updated_count += 1
                
        except Exception as e:
            print(f"Error migrating {filepath}: {e}")
            
    print(f"Migration complete. Updated {updated_count} specs.")

if __name__ == "__main__":
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    migrate_specs(repo_root)
