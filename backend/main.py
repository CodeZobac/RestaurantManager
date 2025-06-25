#!/usr/bin/env python3
"""
Main entry point for Restaurant Manager API

This script properly sets up the Python path and runs the FastAPI application
as a module to avoid relative import issues.
"""

import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

# Now we can import and run the app
if __name__ == "__main__":
    import uvicorn
    from app.main import app
    from app.core.config import settings
    
    print("🍽️  Restaurant Manager API")
    print("=" * 50)
    print(f"📡 Server: http://{settings.host}:{settings.port}")
    print(f"📚 API Documentation: http://{settings.host}:{settings.port}/docs")
    print(f"🔧 Debug mode: {settings.debug}")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload or settings.debug,
        log_level="debug" if settings.debug else "info"
    )
