#!/usr/bin/env python3
"""Script to create database tables"""

import asyncio
from app.core.database import init_database, create_tables

async def main():
    """Create database tables"""
    try:
        print("Initializing database...")
        init_database()
        print("Creating tables...")
        await create_tables()
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
