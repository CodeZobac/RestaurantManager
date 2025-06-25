#!/usr/bin/env python3
"""Test script to verify Supabase connection and add test data"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database import init_database, get_database_session
from app.models.table import Table
from sqlalchemy import text

async def test_connection():
    """Test Supabase connection and add test data"""
    try:
        print("🔧 Initializing database connection...")
        init_database()
        
        print("🔌 Testing database connection...")
        async for db in get_database_session():
            # Test basic connection
            result = await db.execute(text("SELECT version();"))
            version = result.scalar()
            print(f"✅ Connected to PostgreSQL: {version}")
            
            # Test table exists
            result = await db.execute(text("SELECT COUNT(*) FROM tables;"))
            count = result.scalar()
            print(f"📊 Current tables count: {count}")
            
            # Add missing columns if they don't exist
            try:
                await db.execute(text("ALTER TABLE tables ADD COLUMN IF NOT EXISTS is_joined BOOLEAN DEFAULT false;"))
                await db.execute(text("ALTER TABLE tables ADD COLUMN IF NOT EXISTS joined_group_id VARCHAR(50);"))
                await db.commit()
                print("✅ Table structure updated")
            except Exception as e:
                print(f"ℹ️ Table structure: {e}")
                await db.rollback()
            
            # Insert test data
            try:
                # Check if test data already exists
                result = await db.execute(text("SELECT COUNT(*) FROM tables WHERE name = 'T1';"))
                exists = result.scalar()
                
                if exists == 0:
                    await db.execute(text("""
                        INSERT INTO tables (name, capacity, location, status, is_joined, joined_group_id) 
                        VALUES ('T1', 4, 'Main Dining', 'available', false, NULL);
                    """))
                    await db.commit()
                    print("✅ Test table T1 added successfully")
                else:
                    print("ℹ️ Test table T1 already exists")
                
                # Verify data
                result = await db.execute(text("SELECT name, capacity, location, status FROM tables;"))
                tables = result.fetchall()
                print(f"📋 Tables in database:")
                for table in tables:
                    print(f"   - {table.name}: capacity={table.capacity}, location={table.location}, status={table.status}")
                
            except Exception as e:
                print(f"❌ Error with test data: {e}")
                await db.rollback()
            
            break  # Only use first session
            
        print("\n🎉 Supabase connection test completed successfully!")
        print("📡 Your data is now going to Supabase PostgreSQL database")
        
    except Exception as e:
        print(f"❌ Connection error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
