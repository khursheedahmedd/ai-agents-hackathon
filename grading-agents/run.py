#!/usr/bin/env python3
"""
Smart Grade AI FastAPI Application Startup Script
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir.parent))

def main():
    """Main entry point for the application"""
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  Warning: .env file not found. Using environment variables or defaults.")
        print("   Copy env.example to .env and configure your API keys.")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Import settings
    try:
        from app.config import settings
        print(f"🚀 Starting Smart Grade AI FastAPI...")
        print(f"   Host: {settings.HOST}")
        print(f"   Port: {settings.PORT}")
        print(f"   Debug: {settings.DEBUG}")
        print(f"   API Version: {settings.VERSION}")
        
        # Validate required environment variables
        required_vars = [
            "AZURE_OPENAI_API_KEY",
            "AZURE_OPENAI_ENDPOINT",
            "AZURE_OPENAI_DEPLOYMENT_NAME",
            "MISTRAL_API_KEY",
            "CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET"
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            print(f"❌ Missing required environment variables: {missing_vars}")
            print("   Please set these variables in your .env file or environment.")
            sys.exit(1)
        
        print("✅ All required environment variables are set")
        
    except ImportError as e:
        print(f"❌ Error importing configuration: {e}")
        sys.exit(1)
    
    # Start the server
    try:
        uvicorn.run(
            "app.main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down Smart Grade AI FastAPI...")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
