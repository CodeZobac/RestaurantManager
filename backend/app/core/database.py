"""Database configuration is now handled by Supabase REST API. No direct DB connection used."""

# This file is now obsolete. All database operations are performed via Supabase REST API.


def init_database():
    raise NotImplementedError(
        "Direct database connection is not used. Use Supabase REST API."
    )


def get_database_session():
    raise NotImplementedError(
        "Direct database session is not used. Use Supabase REST API."
    )
