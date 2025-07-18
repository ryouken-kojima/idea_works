#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL path
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Check if the path is for an actual file (css, js, etc)
        if os.path.exists(self.translate_path(path)) and os.path.isfile(self.translate_path(path)):
            # Serve the file normally
            super().do_GET()
        else:
            # For all other paths, serve index.html
            self.path = '/index.html'
            super().do_GET()

PORT = 3000
Handler = SPAHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}/")
    httpd.serve_forever()