import json
import sys
import os
from http.server import BaseHTTPRequestHandler
from datetime import datetime

# Add parent directory to path to import scraper module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper import scrape_blocket, save_to_mongo

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """
        Handle GET requests to /api/scrape
        """
        try:
            # Set CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # Start time for performance tracking
            start_time = datetime.now()
            
            # Run the scraper
            car_ads = scrape_blocket()
            
            # Save to MongoDB
            stats = save_to_mongo(car_ads)
            
            # Calculate execution time
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Prepare response
            response = {
                "success": True,
                "message": "Scraping completed successfully",
                "stats": stats,
                "execution_time_seconds": execution_time,
                "timestamp": datetime.now().isoformat()
            }
            
            # Send response
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            # Handle errors
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            error_response = {
                "success": False,
                "message": f"Error during scraping: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
            
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        """
        Handle OPTIONS requests for CORS preflight
        """
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

# For local testing
if __name__ == "__main__":
    from http.server import HTTPServer
    
    port = int(os.getenv('PORT', 8000))
    server = HTTPServer(('localhost', port), Handler)
    print(f"Starting server on port {port}")
    server.serve_forever() 