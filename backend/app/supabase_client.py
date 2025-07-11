from dotenv import load_dotenv

load_dotenv()
import os
import httpx
from typing import Optional, Dict, Any

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]


def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


async def supabase_get(table: str, params: Optional[Dict[str, Any]] = None):
    async with httpx.AsyncClient() as client:
        # Handle both string and dict params for backwards compatibility
        if isinstance(params, str):
            url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
            query_params = None
        else:
            url = f"{SUPABASE_URL}/rest/v1/{table}"
            query_params = params
            
        resp = await client.get(
            url,
            headers=get_supabase_headers(),
            params=query_params,
        )
        resp.raise_for_status()
        return resp.json()


async def supabase_post(table, data):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=get_supabase_headers(),
            json=data,
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise Exception(f"Supabase POST error: {resp.text}") from e
        return resp.json()


async def supabase_patch(table, row_id, data, id_column="id"):
    async with httpx.AsyncClient() as client:
        resp = await client.patch(
            f"{SUPABASE_URL}/rest/v1/{table}?{id_column}=eq.{row_id}",
            headers=get_supabase_headers(),
            json=data,
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise Exception(f"Supabase PATCH error: {resp.text}") from e
        return resp.json()


async def supabase_delete(table, row_id, id_column="id"):
    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{SUPABASE_URL}/rest/v1/{table}?{id_column}=eq.{row_id}",
            headers=get_supabase_headers(),
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise Exception(f"Supabase DELETE error: {resp.text}") from e
        return resp.json()
