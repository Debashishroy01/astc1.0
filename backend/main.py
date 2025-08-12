#!/usr/bin/env python3
"""
ASTC Backend Main Entry Point
Agentic SAP Testing Copilot - Main server startup script
"""

import sys
import os
import argparse
from server import ASTCServer

def main():
    """Main entry point for ASTC backend"""
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='ASTC Backend Server')
    parser.add_argument('--host', default='localhost', help='Server host (default: localhost)')
    parser.add_argument('--port', type=int, default=8000, help='Server port (default: 8000)')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    # Print startup banner
    print("=" * 60)
    print("  ASTC - Agentic SAP Testing Copilot")
    print("  Backend Server v1.0.0")
    print("=" * 60)
    print(f"  Python version: {sys.version}")
    print(f"  Server host: {args.host}")
    print(f"  Server port: {args.port}")
    print(f"  Debug mode: {args.debug}")
    print("=" * 60)
    
    try:
        # Create and start server
        server = ASTCServer(host=args.host, port=args.port)
        server.start()
        
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 