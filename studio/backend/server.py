import http.server
import socketserver
import json
import os
import sys
import mimetypes

# Ensure backend dir is in path for module imports if running directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
# Also add current directory to be safe
sys.path.append(os.path.dirname(__file__))

# Configuration
PORT = 8002
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "../frontend/dist")
# Ensure we serve from absolute path
FRONTEND_DIR = os.path.abspath(FRONTEND_DIR)

from . import specs
from .importer import RequestImporter

class StudioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # We need to setup managers before calling super because super calls do_GET/etc immediately
        # But SimpleHTTPRequestHandler is an old style class in some versions, 
        # actually standard way is to set server.importer and access via self.server if using ThreadingHTTPServer.
        # But here we are just instantiating per request? No, Handler is instantiated per request.
        # We should probably initialize managers globally or check if they are lightweight.
        # SpecManager scans FS, so maybe lightweight enough.
        repo_root = os.path.join(os.path.dirname(__file__), "../../../")
        self.spec_manager = specs.SpecManager(repo_root)
        self.importer = RequestImporter(repo_root)
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)


    def api_list_files(self, query):
        from urllib.parse import parse_qs
        params = parse_qs(query)
        target_path = "."
        
        if "path" in params:
            target_path = params["path"][0]
            
        target_path = os.path.abspath(target_path)
        if not os.path.exists(target_path):
            self.send_error(404, "Path not found")
            return

        files = []
        parent = os.path.dirname(target_path)
        if parent and parent != target_path:
            files.append({"name": "..", "is_dir": True, "path": parent})

        with os.scandir(target_path) as entries:
            for entry in entries:
                files.append({
                    "name": entry.name,
                    "is_dir": entry.is_dir(),
                    "path": entry.path
                })
        
        files.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))
        
        self.send_json({
            "files": files,
            "current_path": target_path
        })

    def api_read_caption(self, query):
        from urllib.parse import parse_qs
        params = parse_qs(query)
        if "path" not in params:
            self.send_error(400, "Missing path")
            return
            
        img_path = params["path"][0]
        base = os.path.splitext(img_path)[0]
        txt_path = base + ".txt"
        
        content = ""
        if os.path.exists(txt_path):
            with open(txt_path, "r", encoding="utf-8") as f:
                content = f.read()
                
        self.send_json({"content": content, "path": txt_path})

    def api_serve_image(self, query):
        from urllib.parse import parse_qs
        params = parse_qs(query)
        if "path" not in params:
            self.send_error(400, "Missing path")
            return
            
        img_path = params["path"][0]
        if not os.path.exists(img_path):
            self.send_error(404, "Image not found")
            return
            
        mime_type, _ = mimetypes.guess_type(img_path)
        if not mime_type:
            mime_type = "application/octet-stream"
            
        with open(img_path, "rb") as f:
            content = f.read()
            
        self.send_response(200)
        self.send_header("Content-type", mime_type)
        self.end_headers()
        self.wfile.write(content)


    def api_project_status(self):
        # Placeholder for now
        self.send_json({"status": "active"})

    def api_list_specs(self):
        from . import specs
        repo_root = os.path.join(os.path.dirname(__file__), "../../../")
        manager = specs.SpecManager(repo_root)
        self.send_json({"specs": manager.list_specs()})

    def api_save_spec(self):
        from . import specs
        repo_root = os.path.join(os.path.dirname(__file__), "../../../")
        manager = specs.SpecManager(repo_root)
        
        length = int(self.headers["Content-Length"])
        data = json.loads(self.rfile.read(length))
        
        saved = manager.save_spec(data)
        self.send_json(saved)

    def api_list_checkpoints(self):
        from . import specs
        repo_root = os.path.join(os.path.dirname(__file__), "../../../")
        manager = specs.SpecManager(repo_root)
        self.send_json({"checkpoints": manager.get_checkpoints()})

    def api_system_info(self):
        info = {
            "python_version": sys.version,
            "platform": sys.platform,
            "cwd": os.getcwd()
        }
        self.send_json(info)

    def api_save_caption(self):
        try:
            length = int(self.headers["Content-Length"])
            data = json.loads(self.rfile.read(length))
            
            txt_path = data.get("path")
            content = data.get("content", "")
            
            if not txt_path:
                self.send_error(400, "Missing path")
                return
                
            # Security: ensure path is within allowed dirs?
            # For now assume mostly trusted local usage.
            if not os.path.abspath(txt_path).startswith(os.getcwd()):
                 # maybe warn?
                 pass

            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(content)
                
            self.send_json({"status": "saved"})
        except Exception as e:
             self.send_error(500, str(e))

    def api_save_config(self):
        try:
            length = int(self.headers["Content-Length"])
            data = json.loads(self.rfile.read(length))
            
            # Save to project root or specific config dir
            output_file = "lora_config.json"
            repo_root = os.path.join(os.path.dirname(__file__), "../../../")
            full_path = os.path.join(repo_root, output_file)
            
            with open(full_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
                
            self.send_json({"status": "saved", "file": output_file})
        except Exception as e:
            self.send_error(500, str(e))

    def api_generate(self):
        from .generator import generate_asset
        
        length = int(self.headers["Content-Length"])
        try:
            config = json.loads(self.rfile.read(length))
            repo_root = os.path.join(os.path.dirname(__file__), "../../../")
            workflow_path = os.path.join(repo_root, "scripts/comfyui/workflow-api.json")
            
            path = config.get("path")
            result = generate_asset(path, workflow_path, config=config)
            self.send_json(result)
        except Exception as e:
            self.send_error(500, str(e))

    def api_import_request(self):
        try:
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length).decode('utf-8')
            data = json.loads(body)
            filename = data.get("filename")
            
            result = self.importer.parse_and_import(filename)
            self.send_json(result)
        except Exception as e:
            self.send_error(500, str(e))

    def api_list_requests(self):
        requests = self.importer.list_requests()
        self.send_json({"requests": requests})

    def send_json(self, data):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def serve_asset_file(self):
        # Serve from ../../../assets or similar
        repo_root = os.path.join(os.path.dirname(__file__), "../../../")
        asset_path = os.path.join(repo_root, self.path.lstrip("/"))
        if not os.path.exists(asset_path):
            self.send_error(404, "Asset not found")
            return
        
        mime_type, _ = mimetypes.guess_type(asset_path)
        self.send_response(200)
        self.send_header("Content-type", mime_type or "application/octet-stream")
        self.end_headers()
        with open(asset_path, "rb") as f:
            self.wfile.write(f.read())

    def serve_react_app(self):
        # Serve index.html for all non-API routes to support SPA routing
        path = os.path.join(FRONTEND_DIR, "index.html")
        if not os.path.exists(path):
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"<h1>Frontend not built. Run npm run build in studio/frontend</h1>")
            return
            
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        with open(path, "rb") as f:
            self.wfile.write(f.read())

    def do_POST(self):
        if self.path.startswith("/api/save-caption"):
            self.api_save_caption()
        elif self.path.startswith("/api/save-config"):
            self.api_save_config()
        elif self.path.startswith("/api/generate"):
            self.api_generate()
        elif self.path.startswith("/api/specs"):
             self.api_save_spec()
        elif self.path.startswith("/api/import-request"):
             self.api_import_request()
        elif self.path.startswith("/api/project-status"):
            self.api_project_status()
        else:
            self.send_error(404, "Not Found")

    def do_GET(self):
        if self.path.startswith("/api/system-info"):
            self.api_system_info()
        elif self.path.startswith("/api/list-files"):
            query = self.path.split("?", 1)[1] if "?" in self.path else ""
            self.api_list_files(query)
        elif self.path.startswith("/api/read-caption"):
            query = self.path.split("?", 1)[1] if "?" in self.path else ""
            self.api_read_caption(query)
        elif self.path.startswith("/api/specs"):
             self.api_list_specs()
        elif self.path.startswith("/api/requests"):
             self.api_list_requests()
        elif self.path.startswith("/api/checkpoints"):
             self.api_list_checkpoints()
        elif self.path.startswith("/api/image"):
            query = self.path.split("?", 1)[1] if "?" in self.path else ""
            self.api_serve_image(query)
        elif self.path.startswith("/assets/"):
            self.serve_asset_file()
        else:
            self.serve_react_app()

def run_server():
    print(f"Starting Asset Studio at http://localhost:{PORT}")
    with socketserver.ThreadingTCPServer(("", PORT), StudioHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    run_server()
