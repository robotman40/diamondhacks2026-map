from supabase import create_client, Client
from config import get_supabase_creds 

def get_supabase_client() -> Client:
    creds = get_supabase_creds()
    SUPABASE_URL = creds["SUPABASE_URL"]
    SUPABASE_KEY = creds["SUPABASE_KEY"]
    return create_client(SUPABASE_URL, SUPABASE_KEY)

