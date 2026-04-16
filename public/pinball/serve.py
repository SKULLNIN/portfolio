#!/usr/bin/env python3
"""
WASM-compatible HTTP server for Space Cadet Pinball.
Adds the two headers required by browsers to allow SharedArrayBuffer.
Run with: python3 serve.py
Then open: http://localhost:8080
"""

import http.server
import os
import socketserver

PORT = 8080

# Serve from this script's directory so `python serve.py` works from anywhere
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class WasmHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # These two headers are REQUIRED for WASM with SharedArrayBuffer
        self.send_header("Cross-Origin-Opener-Policy",   "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Suppress noisy 304 logs, keep errors visible
        if args and str(args[1]) not in ('200', '304'):
            super().log_message(fmt, *args)

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), WasmHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
