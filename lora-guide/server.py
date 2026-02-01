import http.server
import socketserver
import json
import os
import sys

PORT = 8000
DIRECTORY = "frontend/dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/system-info"):
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            info = {
                "python_version": sys.version,
                "platform": sys.platform,
                "cwd": os.getcwd()
            }
            self.wfile.write(json.dumps(info).encode("utf-8"))
            return

        if self.path.startswith("/api/list-files"):
            try:
                # Parse query params
                query_path = "."
                if "?" in self.path:
                    from urllib.parse import urlparse, parse_qs
                    query = urlparse(self.path).query
                    params = parse_qs(query)
                    if "path" in params:
                        query_path = params["path"][0]

                # Resolve absolute path to avoid ambiguity
                target_path = os.path.abspath(query_path)
                
                if not os.path.exists(target_path):
                     raise FileNotFoundError(f"Path not found: {target_path}")

                files = []
                # Add parent directory option if not at root
                parent = os.path.dirname(target_path)
                if parent and parent != target_path:
                    files.append({
                        "name": "..",
                        "is_dir": True,
                        "path": parent
                    })

                for entry in os.scandir(target_path):
                    files.append({
                        "name": entry.name,
                        "is_dir": entry.is_dir(),
                        "path": os.path.abspath(entry.path)
                    })
                
                # Sort: Directories first, then files
                files.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))

                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "files": files,
                    "current_path": target_path
                }).encode("utf-8"))
            except Exception as e:
                self.send_error(500, str(e))
            return
            
        if self.path.startswith("/api/image"):
            try:
                from urllib.parse import urlparse, parse_qs
                query = urlparse(self.path).query
                params = parse_qs(query)
                if "path" not in params:
                    self.send_error(400, "Missing path param")
                    return
                
                image_path = params["path"][0]
                # Security check (basic)
                if not os.path.exists(image_path):
                    self.send_error(404, "File not found")
                    return

                # Determine mime type
                ext = os.path.splitext(image_path)[1].lower()
                mime = "image/jpeg"
                if ext == ".png": mime = "image/png"
                elif ext == ".webp": mime = "image/webp"
                
                with open(image_path, "rb") as f:
                    content = f.read()
                    
                self.send_response(200)
                self.send_header("Content-type", mime)
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, str(e))
            return

        if self.path.startswith("/api/read-caption"):
            try:
                from urllib.parse import urlparse, parse_qs
                query = urlparse(self.path).query
                params = parse_qs(query)
                if "path" not in params:
                    self.send_error(400, "Missing path param")
                    return
                    
                image_path = params["path"][0]
                # Replace image extension with .txt
                base_path = os.path.splitext(image_path)[0]
                txt_path = base_path + ".txt"
                
                content = ""
                if os.path.exists(txt_path):
                    with open(txt_path, "r", encoding="utf-8") as f:
                        content = f.read()
                
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"content": content, "path": txt_path}).encode("utf-8"))
            except Exception as e:
                self.send_error(500, str(e))
            return

        # Fallback to serving static files
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/save-caption"):
            try:
                length = int(self.headers["Content-Length"])
                data = json.loads(self.rfile.read(length))
                
                txt_path = data.get("path")
                content = data.get("content", "")
                
                if not txt_path:
                    self.send_error(400, "Missing path")
                    return
                    
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(content)
                    
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "saved"}).encode("utf-8"))
            except Exception as e:
                 self.send_error(500, str(e))
            return

        if self.path.startswith("/api/save-config"):
            length = int(self.headers["Content-Length"])
            data = json.loads(self.rfile.read(length))
            
            # Save to a file
            output_file = "lora_config.json"
            with open(output_file, "w") as f:
                json.dump(data, f, indent=4)
                
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "saved", "file": output_file}).encode("utf-8"))
            return

        self.send_error(404, "Not Found")

def run_server():
    # Ensure dist folder exists to avoid startup error if not built yet
    if not os.path.exists(DIRECTORY):
        os.makedirs(DIRECTORY, exist_ok=True)
        with open(os.path.join(DIRECTORY, "index.html"), "w") as f:
            f.write("<h1>Frontend not built yet. Run npm run build in frontend/</h1>")

    print(f"Serving at http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    run_server()
