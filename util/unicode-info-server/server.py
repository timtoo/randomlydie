import http.server
import socketserver
import json
import unicodedata
import sys, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)

DEFAULT_PORT = 8888

try:
    PORT = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
except ValueError:
    print("Invalid port provided. Using default 8000.")
    PORT = DEFAULT_PORT

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/info'):
            try:
                # Get the 'q' parameter (e.g., /api/info?q=0041 or /api/info?q=0x0041 or /api/info?q=A)
                query = self.path.split('q=')[1].split('&')[0]
                
                # Try to interpret as hex; if it fails, treat as character
                try:
                    if query.startswith('0x'):
                        query = query[2:]
                    codepoint = int(query, 16)
                    char = chr(codepoint)
                except ValueError:
                    char = query[0]
                
                data = {
                    "char": char,
                    "codepoint": f"U+{ord(char):04X}",
                    "name": unicodedata.name(char, "UNKNOWN"),
                    "category": unicodedata.category(char),
                    "combining": unicodedata.combining(char),
                    "decimal": unicodedata.decimal(char, None),
                    "digit": unicodedata.digit(char, None),
                    "numeric": unicodedata.numeric(char, None),
                    "mirrored": bool(unicodedata.mirrored(char))
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
            except Exception as e:
                self.send_error(400, f"Error: {str(e)}")
        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()

