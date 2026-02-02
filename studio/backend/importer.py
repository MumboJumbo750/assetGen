import os
import re
import json
import uuid
import logging
from .specs import SpecManager

logger = logging.getLogger(__name__)

class RequestImporter:
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.requests_dir = os.path.join(root_dir, "requests")
        self.spec_manager = SpecManager(root_dir)

    def list_requests(self):
        """List all .md files in the requests directory."""
        if not os.path.exists(self.requests_dir):
            return []
        
        requests = []
        for f in os.listdir(self.requests_dir):
            if f.endswith(".md") and f != "REQUEST_TEMPLATE.md":
                 requests.append(f)
        return requests

    def parse_and_import(self, filename):
        """Parse an MD file and create specs for assets found."""
        filepath = os.path.join(self.requests_dir, filename)
        if not os.path.exists(filepath):
            return {"status": "error", "message": "File not found"}

        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        imported_count = 0
        errors = []

        # 1. Direct file listing parser (bullet points)
        list_pattern = re.compile(r'-\s+[`"]?(assets/[a-zA-Z0-9_\-\./]+)[`"]?(?::\s*(.*))?')
        
        # 2. Tree parser state
        tree_context = [] # stack of directory names
        # We assume root is explicitly mentioned or we detect "assets/"
        
        for line in lines:
            line_stripped = line.strip()
            
            # Method 1: Bullet points
            match = list_pattern.search(line_stripped)
            if match:
                rel_path = match.group(1)
                description = match.group(2) if match.group(2) else ""
                self._save_spec(rel_path, description, errors)
                imported_count += 1
                continue

            # Method 2: ASCII Tree
            # Detect root 'assets/'
            if line_stripped == 'assets/':
                tree_context = ['assets']
                continue
                
            if not tree_context:
                continue

            # Regex to find tree markers and indentation
            # Matches: (indentation_chars)(marker)(name)
            # Indent is usually combinations of "|   ", "    ", "│   "
            # Marker is "├── " or "└── "
            
            # Simple indentation check suitable for strict tree output
            # Count how many sets of 4 chars (space or bar+space)
            # This is heuristic and might be fragile, but works for standard `tree` output or manual markdown trees
            
            # Pattern: prefix consisting of (│   ) or (    ), followed by (├── |└── )(name)
            # Note: unicode chars may vary.
            
            tree_match = re.match(r'^((?:[│\s]{4})*)(├── |└── )(.+)$', line.rstrip())
            if tree_match:
                prefix = tree_match.group(1)
                marker = tree_match.group(2)
                name = tree_match.group(3).strip()
                
                # Calculate depth based on prefix length (4 chars per level)
                depth = len(prefix) // 4
                
                # Adjust stack
                # tree_context[0] is root (depth 0).
                # If depth is 0, we are at root children.
                # We want tree_context to have length = depth + 1 (root included)
                
                while len(tree_context) > depth + 1:
                    tree_context.pop()
                    
                full_path_parts = tree_context + [name]
                
                if name.endswith("/"):
                    # It is a directory
                    # Ensure we are pushing to the right level?
                    # If we are just defining a dir, we push it if it's new
                    if len(tree_context) <= depth + 1:
                         tree_context.append(name.rstrip("/"))
                    else:
                         # Should not happen if logic is correct?
                         # Just reset/replace
                         tree_context = tree_context[:depth+1] + [name.rstrip("/")]
                else:
                    # It is a file
                    rel_path = "/".join(full_path_parts)
                    # Create spec
                    if self._save_spec(rel_path, "", errors):
                        imported_count += 1

        return {
            "status": "success", 
            "imported": imported_count, 
            "errors": errors,
            "filename": filename
        }

    def _save_spec(self, rel_path, description, errors):
        # Clean path
        rel_path = rel_path.replace("\\", "/")
        
        # Calculate Domain Model fields based on path structure
        # Expected: assets/{project}/{category}/{kit?}/{name}.png
        path_parts = rel_path.split("/")
        
        domain = "cosmic" # Default
        kit = "standalone"
        role = "image"
        
        if len(path_parts) >= 3:
            category = path_parts[2] # e.g., sprites, backgrounds, ui
            
            if category == "sprites" and len(path_parts) >= 4:
                kit_name = path_parts[3] # e.g., astro-duck, planets, satellites
                if kit_name == "astro-duck":
                    kit = "astroDuck"
                    if "base" in rel_path: role = "base"
                    elif "outfits" in rel_path: role = "outfit"
                    elif "expressions" in rel_path: role = "expression"
                    elif "poses" in rel_path: role = "pose"
                elif kit_name == "planets":
                    kit = "planet"
                    if "texture" in rel_path: role = "texture"
                    elif "atmosphere" in rel_path: role = "atmosphere"
                    elif "ring" in rel_path: role = "ring"
                    elif "state" in rel_path: role = "state"
                elif kit_name == "satellites":
                    kit = "satellite"
                    if "glow" in rel_path: role = "glow"
                    elif "badge" in rel_path: role = "badge"
                    elif "state" in rel_path: role = "state"
                    else: role = "icon"
            
            elif category == "backgrounds":
                kit = "background"
                role = "layer"
                
            elif category == "ui":
                domain = "ui"
                kit = "ui"
                role = "component"

        # Basic Spec Data
        name = os.path.basename(rel_path)
        clean_name = os.path.splitext(name)[0]

        spec_data = {
            "id": str(uuid.uuid4()),
            "name": clean_name,
            "path": rel_path,
            "type": "image",
            "domain": domain,
            "kit": kit,
            "role": role,
            "params": {
                "prompts": {
                    "default": description.strip()
                }
            },
            "status": "planned"
        }
        
        # Mirror folder structure in database/specs
        # e.g. assets/zelos/foo.png -> zelos/foo.json (relative to specs dir)
        mirror_path = rel_path
        if mirror_path.startswith("assets/"):
            mirror_path = mirror_path[7:] # strip assets/
        
        base, _ = os.path.splitext(mirror_path)
        spec_data["_rel_path"] = f"{base}.json"

        try:
            self.spec_manager.save_spec(spec_data)
            return True
        except Exception as e:
            errors.append(f"Failed to save {rel_path}: {str(e)}")
            return False

