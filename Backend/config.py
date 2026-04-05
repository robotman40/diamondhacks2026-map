import os
import dotenv


def get_supabase_creds():
    dotenv.load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return {"SUPABASE_URL":url, "SUPABASE_KEY":key}
#graph hopper
def get_gh_creds():
    dotenv.load_dotenv()
    return os.getenv("GH_API_KEY")
#browser use
def get_bu_api_key():
    dotenv.load_dotenv()
    return os.getenv("BROWSER_USE_API_KEY")
#four sqaure
def get_fsq_api_key():
    dotenv.load_dotenv()
    return os.getenv("FS_API_KEY")