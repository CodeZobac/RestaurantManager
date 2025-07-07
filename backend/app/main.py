"""FastAPI application entry point for Restaurant Manager API"""

import asyncio
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .routers import tables, reservations, telegram, auth, restaurants, telegram_settings
from .services.background_tasks import main_task

# Load environment variables from .env file
load_dotenv()

background_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    global background_task
    # Startup
    print(
        f"📊 API Documentation available at: http://{settings.host}:{settings.port}/docs"
    )
    background_task = asyncio.create_task(main_task())
    yield
    # Shutdown
    if background_task:
        background_task.cancel()
        try:
            await background_task
        except asyncio.CancelledError:
            pass
    print("🛑 No database connections to close (using Supabase REST API)")

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    ## Restaurant Manager API
    
    A comprehensive FastAPI backend for restaurant table management and reservations.
    
    ### Features:
    * **Table Management**: CRUD operations for restaurant tables
    * **Table Joining**: Combine tables for larger parties (T1+T2+T3)
    * **Supabase Integration**: PostgreSQL database with real-time capabilities
    * **Auto-numbering**: Tables automatically numbered as T1, T2, T3, etc.
    
    ### Table Numbering System:
    - Individual tables: T1, T2, T3, T4...
    - Joined tables: T1+T2+T3 (shown as single unit)
    - Default capacity: 2 per table
    - Combined capacity when joined
    
    ### API Structure:
    - **POST /tables**: Create new table
    - **GET /tables**: List all tables (with joining logic)
    - **PUT /tables/{id}**: Update table
    - **DELETE /tables/{id}**: Delete table
    - **POST /tables/join**: Join multiple tables
    - **POST /tables/unjoin**: Separate joined tables
    
    ### Implementation Status:
    🚧 **This is a placeholder implementation with complete API structure.**
    
    All endpoints are defined with proper schemas and documentation,
    but the actual business logic needs to be implemented in the service layer.
    
    ### Next Steps for Implementation:
    1. Set up Supabase connection credentials
    2. Implement TableService methods
    3. Add authentication/authorization
    4. Implement reservation integration
    5. Add WebSocket support for real-time updates
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tables.router, prefix="/api/v1")
app.include_router(reservations.router, prefix="/api/v1")
app.include_router(telegram.router, prefix="/api/v1")
app.include_router(telegram_settings.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(restaurants.router, prefix="/api/v1")



# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Restaurant Manager API",
        "version": settings.app_version,
        "status": "🚧 Placeholder Implementation",
        "docs": "/docs",
        "description": "FastAPI backend for restaurant table management",
        "features": [
            "Table CRUD operations",
            "Table joining/unjoining",
            "Supabase PostgreSQL integration",
            "Auto table numbering (T1, T2, T3...)",
            "Complete API documentation",
        ],
        "implementation_status": {
            "api_structure": "✅ Complete",
            "database_models": "✅ Complete",
            "pydantic_schemas": "✅ Complete",
            "business_logic": "🚧 TODO - Placeholder methods",
            "supabase_connection": "🚧 TODO - Needs credentials",
            "authentication": "🚧 TODO - Future phase",
        },
        "next_steps": [
            "Set DATABASE_URL environment variable",
            "Implement TableService methods",
            "Test with Supabase database",
            "Add authentication layer",
        ],
    }

# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "API is running",
        "version": settings.app_version,
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": "An unexpected error occurred. Please check the server logs.",
            "type": "internal_error",
        },
    )

if __name__ == "__main__":
    import uvicorn

    print(f"🍽️  Starting Restaurant Manager API...")
    print(f"📡 Server: http://{settings.host}:{settings.port}")
    print(f"📚 Documentation: http://{settings.host}:{settings.port}/docs")
    print(f"🔧 Debug mode: {settings.debug}")

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload or settings.debug,
        log_level="debug" if settings.debug else "info",
    )
