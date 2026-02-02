import os
import json
import glob
import uuid
import subprocess
import shutil
import zipfile
import itertools
from datetime import datetime

class SpecManager:
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.specs_dir = os.path.join(root_dir, "database", "specs")
        self.assets_dir = os.path.join(root_dir, "assets")
        self._indexes_cache = None
        self.ensure_dirs()

    def ensure_dirs(self):
        os.makedirs(self.specs_dir, exist_ok=True)
        os.makedirs(self.assets_dir, exist_ok=True)

    # ─────────────────────────────────────────────────────────────────────────
    # Index File Support (zelos-asset-index.json, zelos-audio-index.json, etc.)
    # ─────────────────────────────────────────────────────────────────────────

    def get_index_files(self):
        """Find all *-index.json files in the specs directory."""
        index_files = []
        pattern = os.path.join(self.specs_dir, "**", "*-index.json")
        for f in glob.glob(pattern, recursive=True):
            index_files.append(f)
        return index_files

    def load_indexes(self, force=False):
        """Load and cache all index files."""
        if self._indexes_cache is not None and not force:
            return self._indexes_cache

        indexes = {}
        for filepath in self.get_index_files():
            try:
                with open(filepath, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                    name = os.path.basename(filepath).replace('.json', '')
                    data['_source_file'] = filepath
                    data['_index_id'] = name
                    indexes[name] = data
            except Exception as e:
                print(f"Error loading index {filepath}: {e}")

        self._indexes_cache = indexes
        return indexes

    def expand_index_entry(self, entry, lists, root="", animation_types=None, composite_types=None):
        """Expand a single index entry using its vars and the lists definitions."""
        entry_type = entry.get('type')
        
        # Helper to build animation config from entry or type reference
        def get_animation_config(entry):
            if entry.get('animation'):
                # Inline animation config
                anim = entry['animation'].copy()
                # If animation references a type, merge in the type's promptHints
                if animation_types and anim.get('type') in animation_types:
                    type_def = animation_types[anim['type']]
                    if 'promptHints' not in anim and 'promptHints' in type_def:
                        anim['promptHints'] = type_def['promptHints']
                return anim
            return None
        
        # Helper to build composite config from entry or type reference
        def get_composite_config(entry):
            comp_type = entry.get('compositeType')
            if not comp_type:
                return None
            
            config = {
                'type': comp_type,
                'group': entry.get('compositeGroup'),
                'over': entry.get('compositeOver', [])
            }
            
            # Merge in promptHints from compositeTypes definition
            if composite_types and comp_type in composite_types:
                type_def = composite_types[comp_type]
                config['layerOrder'] = type_def.get('layerOrder', 0)
                config['description'] = type_def.get('description')
                if 'promptHints' in type_def:
                    config['promptHints'] = type_def['promptHints']
                if 'promptTemplate' in type_def:
                    config['promptTemplate'] = type_def['promptTemplate']
                if 'anchor' in type_def:
                    config['anchor'] = type_def['anchor']
            
            return config
        
        if entry_type == 'file':
            # Single file entry
            path = entry.get('path', '')
            if root and not path.startswith('/'):
                path = f"{root}/{path}"
            
            result = {
                'id': entry.get('id'),
                'name': os.path.basename(path).replace('.png', '').replace('.wav', '').replace('.ogg', '').replace('.mp4', ''),
                'path': path,
                'format': entry.get('format', 'png'),
                'size': entry.get('size'),
                'status': entry.get('status', 'planned'),
                'source_entry_id': entry.get('id'),
                'type': 'file'
            }
            
            # Add animation config if present
            anim_config = get_animation_config(entry)
            if anim_config:
                result['animation'] = anim_config
            
            # Add composite config if present
            comp_config = get_composite_config(entry)
            if comp_config:
                result['composite'] = comp_config
                
            return [result]
        
        elif entry_type == 'pattern':
            # Pattern entry - expand using vars
            pattern = entry.get('pattern', '')
            vars_def = entry.get('vars', {})
            
            # Get all variable values from lists
            var_names = list(vars_def.keys())
            var_values = []
            for var_name in var_names:
                list_key = vars_def[var_name]
                values = lists.get(list_key, [])
                var_values.append(values)
            
            if not var_values:
                return []
            
            # Get animation config from entry (shared by all expanded items)
            base_anim_config = get_animation_config(entry)
            
            # Get composite config from entry (shared by all expanded items)
            base_comp_config = get_composite_config(entry)
            
            # Generate all combinations
            expanded = []
            for combo in itertools.product(*var_values):
                path = pattern
                var_dict = {}
                for i, var_name in enumerate(var_names):
                    path = path.replace(f"{{{var_name}}}", combo[i])
                    var_dict[var_name] = combo[i]
                
                if root and not path.startswith('/'):
                    path = f"{root}/{path}"
                
                # Generate a unique ID from the path
                asset_id = path.replace('/', '-').replace('.', '-').replace('{', '').replace('}', '')
                
                item = {
                    'id': asset_id,
                    'name': os.path.basename(path).replace('.png', '').replace('.wav', '').replace('.ogg', '').replace('.mp4', ''),
                    'path': path,
                    'format': entry.get('format', 'png'),
                    'size': entry.get('size'),
                    'status': entry.get('status', 'planned'),
                    'source_entry_id': entry.get('id'),
                    'vars': var_dict,
                    'type': 'pattern-expanded'
                }
                
                # Add animation config if present
                if base_anim_config:
                    item['animation'] = base_anim_config.copy()
                
                # Add composite config if present
                if base_comp_config:
                    item['composite'] = base_comp_config.copy()
                
                expanded.append(item)
            
            return expanded
            
            return expanded
        
        return []

    def get_expanded_index(self, index_id):
        """Get a fully expanded index with all patterns resolved."""
        indexes = self.load_indexes()
        index_data = indexes.get(index_id)
        if not index_data:
            return None
        
        lists = index_data.get('lists', {})
        root = index_data.get('root', '')
        entries = index_data.get('entries', [])
        animation_types = index_data.get('animationTypes', {})
        composite_types = index_data.get('compositeTypes', {})
        
        expanded_entries = []
        for entry in entries:
            expanded = self.expand_index_entry(entry, lists, root, animation_types, composite_types)
            for item in expanded:
                # Check if file exists
                full_path = os.path.join(self.root_dir, item['path'])
                item['exists'] = os.path.exists(full_path)
                if item['exists']:
                    item['status'] = 'generated'
            expanded_entries.extend(expanded)
        
        return {
            'id': index_id,
            'version': index_data.get('version', 1),
            'root': root,
            'lists': lists,
            'animationTypes': animation_types,
            'compositeTypes': composite_types,
            'entries': expanded_entries,
            'raw_entries': entries,
            'stats': {
                'total': len(expanded_entries),
                'generated': len([e for e in expanded_entries if e.get('exists')]),
                'planned': len([e for e in expanded_entries if not e.get('exists')])
            }
        }

    def list_all_indexes(self):
        """List all available indexes with summary stats."""
        indexes = self.load_indexes()
        summaries = []
        
        for index_id, data in indexes.items():
            expanded = self.get_expanded_index(index_id)
            summaries.append({
                'id': index_id,
                'version': data.get('version', 1),
                'root': data.get('root', ''),
                'list_count': len(data.get('lists', {})),
                'entry_count': len(data.get('entries', [])),
                'expanded_count': expanded['stats']['total'] if expanded else 0,
                'generated_count': expanded['stats']['generated'] if expanded else 0,
                'source_file': data.get('_source_file', '')
            })
        
        return summaries

    def list_specs(self):
        specs = []
        if not os.path.exists(self.specs_dir):
            return specs
            
        # Use recursive glob to find specs in subdirectories (like specs/zelos/)
        search_pattern = os.path.join(self.specs_dir, "**", "*.json")
        for file in glob.glob(search_pattern, recursive=True):
            try:
                with open(file, 'r', encoding='utf-8-sig') as f:
                    spec = json.load(f)
                    # Ignore non-asset specs (indexes, helper docs) except config
                    if not spec.get("path") and spec.get("type") != "config" and spec.get("id") != "project-style":
                        continue
                    # Add status check
                    spec['status'] = self.check_status(spec)
                    # Add relative path for saving back to same location
                    spec['_rel_path'] = os.path.relpath(file, self.specs_dir)
                    specs.append(spec)
            except Exception as e:
                print(f"Error loading spec {file}: {e}")
        return specs

    def save_spec(self, data):
        if not data.get('id'):
            data['id'] = str(uuid.uuid4())
        
        # Determine save location
        rel_path = data.pop('_rel_path', None)
        if rel_path:
            filepath = os.path.join(self.specs_dir, rel_path)
            # Ensure dir exists if path changed or new
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
        else:
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
            {"id": "juggernaut", "label": "Juggernaut XL", "path": "assets/zelos_variants/juggernaut"},
            {"id": "animagine", "label": "Animagine XL v3.1", "path": "assets/zelos_variants/animagine"},
            {"id": "pony", "label": "Pony Diffusion v6 XL", "path": "assets/zelos_variants/pony"},
            {"id": "protovision", "label": "ProtoVision XL", "path": "assets/zelos_variants/protovision"},
            {"id": "copax", "label": "Copax Timeless", "path": "assets/zelos_variants/copax"},
            {"id": "sdxl", "label": "SDXL base", "path": "assets/zelos_variants/sdxl"},
            {"id": "default", "label": "Default (assets/zelos)", "path": "assets/zelos"}
        ]

    def get_manifest(self):
        specs = self.list_specs()
        indexes = self.list_all_indexes()
        
        # Organize into projects based on paths
        manifest = {
            "title": "Asset Studio Stage",
            "variants": self.get_checkpoints(),
            "indexes": indexes,
            "projects": [
                {
                    "id": "zelos",
                    "label": "Zelos Project",
                    "root": "assets/zelos",
                    "assets": self._get_zelos_assets(specs),
                    "indexes": self._get_project_indexes(),
                    "games": [
                        {
                            "id": "space-shooter",
                            "label": "Space Shooter",
                            "path": "assets/zelos/pixi/games/space-shooter/index.html"
                        },
                        {
                            "id": "jump-run",
                            "label": "Jump & Run",
                            "path": "assets/zelos/pixi/games/jump-run/index.html"
                        }
                    ]
                }
            ]
        }
        return manifest

    def _get_project_indexes(self):
        """Get index summary for the project."""
        return [
            {"id": "zelos-asset-index", "label": "Core Assets", "category": "visual"},
            {"id": "zelos-audio-index", "label": "Audio Assets", "category": "audio"},
            {"id": "zelos-minigame-asset-index", "label": "Minigame Assets", "category": "visual"}
        ]

    def _get_zelos_assets(self, specs):
        # Filter generated assets
        generated = [s for s in specs if s.get('status') == 'generated']
        
        # We still need the Composite definitions because they aren't in individual specs.
        # But we can at least return all generated items.
        assets = []
        
        # Add a special entry for categorized browse
        for s in generated:
            assets.append({
                "id": s.get('id'),
                "label": s.get('name'),
                "path": s.get('path'),
                "type": s.get('type')
            })
            
        # Add basic kit triggers if pieces exist
        has_duck = any(s.get('kit') == 'astroDuck' for s in generated)
        if has_duck:
            assets.insert(0, {
                "id": "astro-duck-composite",
                "type": "composite",
                "kit": "astroDuck",
                "label": "Astro-Duck Builder",
                "maxSize": 260
            })
            
        has_planet = any(s.get('kit') == 'planet' for s in generated)
        if has_planet:
            assets.insert(1, {
                "id": "planet-composite",
                "type": "compositeLayers",
                "kit": "planet",
                "label": "Planet Builder",
                "maxSize": 240
            })
            
        return assets

    def build_kit(self, project_id="zelos"):
        # We'll call our generation script
        # In a real app, this might be a library call
        script_path = os.path.join(self.root_dir, "scripts/generate-pixi-kit.py")
        project_assets = os.path.join(self.root_dir, f"assets/{project_id}")
        output_kit = os.path.join(project_assets, f"pixi/{project_id}-pixi-kit.js")
        
        try:
            subprocess.run(["py", "-3.11", script_path, project_assets, output_kit], check=True)
            return {"status": "success", "path": output_kit}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def export_zip(self, project_id="zelos"):
        project_assets = os.path.join(self.root_dir, f"assets/{project_id}")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_name = f"export_{project_id}_{timestamp}.zip"
        zip_path = os.path.join(self.root_dir, "exports", zip_name)
        
        os.makedirs(os.path.join(self.root_dir, "exports"), exist_ok=True)
        
        try:
            # First build/update the kit
            self.build_kit(project_id)
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
                for root, dirs, files in os.walk(project_assets):
                    for file in files:
                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, project_assets)
                        z.write(full_path, rel_path)
            
            return {"status": "success", "filename": zip_name, "path": zip_path}
        except Exception as e:
            return {"status": "error", "message": str(e)}
