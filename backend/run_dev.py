#!/usr/bin/env python3
"""
Development server runner for Restaurant Manager API

This script provides an easy way to run the development server
with proper environment setup and helpful output.
"""

import os
import sys
from pathlib import Path

def main():
    """Run the development server"""
    # Add the backend directory to Python path
    backend_dir = Path(__file__).parent
    sys.path.insert(0, str(backend_dir))
    
    # Check for .env file
    env_file = backend_dir / ".env"
    env_example = backend_dir / ".env.example"
    
    if not env_file.exists():
        print("⚠️  No .env file found!")
        print(f"📝 Please copy {env_example} to {env_file}")
        print("📝 And fill in your Supabase credentials")
        print()
        print("Example commands:")
        print(f"  cp {env_example} {env_file}")
        print(f"  nano {env_file}  # Edit with your credentials")
        return
    
    # Set environment variables for development
    os.environ.setdefault("DEBUG", "true")
    os.environ.setdefault("RELOAD", "true")
    
    try:
        import uvicorn
        from app.main import app
        from app.core.config import settings
        
        print("🍽️  Restaurant Manager API - Development Server")
        print("=" * 50)
        print(f"📡 Server: http://{settings.host}:{settings.port}")
        print(f"📚 API Documentation: http://{settings.host}:{settings.port}/docs")
        print(f"🔧 Debug mode: {settings.debug}")
        print(f"🔄 Auto-reload: {settings.reload}")
        print("=" * 50)
        print()
        print("🚧 PLACEHOLDER IMPLEMENTATION STATUS:")
        print("   ✅ API structure complete")
        print("   ✅ Database models defined")
        print("   ✅ Pydantic schemas ready")
        print("   🚧 Business logic needs implementation")
        print("   🚧 Supabase connection needs testing")
        print()
        print("📝 Next steps:")
        print("   1. Implement TableService methods")
        print("   2. Test Supabase connection")
        print("   3. Add authentication")
        print()
        print("🔄 Starting server... (Ctrl+C to stop)")
        print()
        
        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.reload,
            log_level="debug" if settings.debug else "info"
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure you've installed dependencies:")
        print("   uv sync")
        print("   # or")
        print("   pip install -e .")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main() or 0)
