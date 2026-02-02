import os
import json
import re
import glob

def generate_kit(root_dir, project_root, output_path):
    """
    Scans the database/specs directory to build the pixi-kit mapping.
    """
    project_name = os.path.basename(project_root.rstrip("/\\"))
    specs_dir = os.path.join(root_dir, "database", "specs")
    
    # Target structures
    astro_duck_paths = {
        "views": ["front", "side", "threeQuarter"],
        "base": {},
        "outfits": {},
        "expressions": {},
        "posePattern": "sprites/astro-duck/poses/astro-duck-{pose}-{view}.png",
        "outfitPosePattern": "sprites/astro-duck/outfits/{outfit}-{pose}-{view}.png",
    }
    
    presets = {
        "astroDuck": { "views": ["front", "side", "threeQuarter"], "poses": [], "outfits": [], "expressions": [] },
        "planet": { "textures": [], "rings": ["cyan"], "atmospheres": [], "states": [] },
        "satellite": { "icons": [], "states": [], "glows": [], "badges": [] },
        "badge": { "rarities": [], "icons": [] },
        "background": { "starfield": "starfield-tile.png", "nebula": "nebula-overlay.png" },
        "ui": {}
    }

    # Helper to clean paths (remove 'assets/zelos/' prefix)
    def clean_rel(p):
        if not p: return p
        prefix = f"assets/{project_name}/"
        if p.startswith(prefix):
            return p[len(prefix):]
        return p

    # 1. Load all specs
    specs = []
    for f in glob.glob(os.path.join(specs_dir, "**", "*.json"), recursive=True):
        try:
            with open(f, 'r', encoding='utf-8-sig') as f_in:
                specs.append(json.load(f_in))
        except: continue

    # 2. Process Composite Specs (Mascots etc)
    for s in specs:
        # Astro Duck Logic
        if s.get("id") == "astro-duck-character-sheet" or "astro-duck" in s.get("name", ""):
            actions = s.get("actions", {})
            
            # Base Views
            if "layout" in s and "views" in s["layout"]:
                for v in s["layout"]["views"]:
                    v_key = "threeQuarter" if v["name"] == "three-quarter" else v["name"]
                    astro_duck_paths["base"][v_key] = clean_rel(v["file"])
            
            # Expressions
            for exp in actions.get("expressions", []):
                eid = exp["id"]
                astro_duck_paths["expressions"][eid] = {
                    "front": clean_rel(exp["paths"].get("front")),
                    "side": clean_rel(exp["paths"].get("side")),
                    "threeQuarter": clean_rel(exp["paths"].get("three-quarter"))
                }
                presets["astroDuck"]["expressions"].append(eid)

            # Poses
            for pose in actions.get("poses", []):
                pid = pose["id"]
                presets["astroDuck"]["poses"].append(pid)

    # 3. Process Individual Specs (Planets, Satellites etc)
    for s in specs:
        kit = s.get("kit")
        role = s.get("role")
        name = s.get("name", "")

        if kit == "planet":
            if role == "texture": presets["planet"]["textures"].append(name[8:] if name.startswith("texture-") else name)
            elif role == "atmosphere": presets["planet"]["atmospheres"].append(name[11:] if name.startswith("atmosphere-") else name)
            elif role == "state": presets["planet"]["states"].append(name[6:] if name.startswith("state-") else name)
        
        elif kit == "satellite":
            if role == "icon": presets["satellite"]["icons"].append(name[10:] if name.startswith("satellite-") else name)
            elif role == "state": presets["satellite"]["states"].append(name[6:] if name.startswith("state-") else name)
            elif role == "glow": presets["satellite"]["glows"].append(name[5:] if name.startswith("glow-") else name)
            elif role == "badge": presets["satellite"]["badges"].append(name[6:] if name.startswith("badge-") else name)

    # Unique and sort presets
    for k in presets:
        if isinstance(presets[k], dict):
            for sub in presets[k]:
                if isinstance(presets[k][sub], list):
                    presets[k][sub] = sorted(list(set(presets[k][sub])))

    # Load logic template
    logic_part = ""
    template_path = os.path.join(os.path.dirname(__file__), "kit-template-logic.js")
    if os.path.exists(template_path):
        with open(template_path, "r", encoding="utf-8") as f:
            logic_part = f.read()

    js_content = f"""// AUTO-GENERATED PIXI KIT FROM SPECS
export const zelosPaths = {{
  root: ".",
  astroDuck: {json.dumps(astro_duck_paths, indent=2)}
}};

export const zelosPalette = {{
  void: "#0a0a0f", space: "#12121a", nebula: "#1a1a2e",
  cosmic: "#252538", stardust: "#2f2f45", neonCyan: "#00f5ff",
  neonMagenta: "#ff00ff", neonLime: "#39ff14", neonOrange: "#ff6b35",
  neonRed: "#ff073a", neonPurple: "#bf00ff", neonYellow: "#fff01f",
  neonPink: "#ff69b4", textPrimary: "#f0f0f5", textSecondary: "#a0a0b0",
  textMuted: "#606070",
}};

export const zelosPresets = {json.dumps(presets, indent=2)};

{logic_part}
"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Generated spec-driven kit at {output_path}")

if __name__ == "__main__":
    import sys
    # root_dir (repo root), project_assets_dir, output_path
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    proj_assets = sys.argv[1] if len(sys.argv) > 1 else "assets/zelos"
    out = sys.argv[2] if len(sys.argv) > 2 else "assets/zelos/pixi/zelos-pixi-kit.js"
    generate_kit(repo_root, proj_assets, out)
