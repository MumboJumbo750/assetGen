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

class StudioHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def do_GET(self):
        # API Routes
        if self.path.startswith("/api/"):
            self.handle_api()
            return

        # SPA Fallback for non-API routes (if file not found)
        # Check if file exists, if not serve index.html for client-side routing
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not "." in os.path.basename(path):
            self.path = "/index.html"
            
        super().do_GET()

    def handle_api(self):
        try:
            url_parts = self.path.split("?")
            endpoint = url_parts[0]
            query = url_parts[1] if len(url_parts) > 1 else ""
            
            if endpoint == "/api/list-files":
                self.api_list_files(query)
            elif endpoint == "/api/read-caption":
                self.api_read_caption(query)
            elif endpoint == "/api/image":
                self.api_serve_image(query)
            else:
                self.send_error(404, "API Endpoint not found")
        except Exception as e:
            self.send_error(500, str(e))

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

    def do_POST(self):
        if self.path.startswith("/api/save-caption"):
            self.api_save_caption()
        elif self.path.startswith("/api/save-config"):
            self.api_save_config()
        elif self.path.startswith("/api/generate"):
            self.api_generate()
        elif self.path.startswith("/api/project-status"):
            self.api_project_status()
        else:
            self.send_error(404, "Not Found")

    def api_generate(self):
        from . import generator
        length = int(self.headers["Content-Length"])
        data = json.loads(self.rfile.read(length))
        
        rel_path = data.get("path")
        if not rel_path:
            self.send_error(400, "Missing path")
            return

        # Locate workflow
        repo_root = os.path.join(os.path.dirname(__file__), "../../../")
        workflow_path = os.path.join(repo_root, "scripts/comfyui/workflows/assetgen_sdxl_api.json")
        if not os.path.exists(workflow_path):
             self.send_error(500, f"Workflow not found at {workflow_path}")
             return

        try:
            result = generator.generate_asset(rel_path, workflow_path)
            self.send_json(result)
        except Exception as e:
            self.send_json({"status": "error", "error": str(e)})

    def api_save_caption(self):
        length = int(self.headers["Content-Length"])
        data = json.loads(self.rfile.read(length))
        
        txt_path = data.get("path")
        content = data.get("content", "")
        
        if txt_path:
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(content)
            self.send_json({"status": "saved"})
        else:
            self.send_error(400, "Missing path")

    def api_save_config(self):
        length = int(self.headers["Content-Length"])
        data = json.loads(self.rfile.read(length))
        
        output_file = "lora_config.json"
        with open(output_file, "w") as f:
            json.dump(data, f, indent=4)
            
        self.send_json({"status": "saved", "file": output_file})

    def send_json(self, data):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

def run_server():
    print(f"Starting Asset Studio on http://localhost:{PORT}")
    print(f"Serving frontend from: {FRONTEND_DIR}")
    
    # Ensure frontend dir exists
    if not os.path.exists(FRONTEND_DIR):
        print(f"WARNING: Frontend directory not found at {FRONTEND_DIR}")
        print("Please run 'npm run build' in studio/frontend/")

    with socketserver.TCPServer(("", PORT), StudioHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    run_server()
