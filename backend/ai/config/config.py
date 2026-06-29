import os
from dataclasses import dataclass
from functools import lru_cache
from dotenv import load_dotenv

# Try to load environment variables from backend/.env first
parent_env = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env'))
if os.path.exists(parent_env):
    load_dotenv(parent_env)
else:
    load_dotenv()

@dataclass(frozen=True)
class Settings:
    flask_env: str
    flask_debug: bool
    db_host: str
    db_port: int
    db_user: str
    db_password: str
    db_name: str
    port: int
    internal_api_secret: str

@lru_cache
def get_settings() -> Settings:
    return Settings(
        flask_env=os.getenv("FLASK_ENV", "development"),
        flask_debug=os.getenv("FLASK_DEBUG", "0") == "1",
        db_host=os.getenv("DB_HOST", "127.0.0.1"),
        db_port=int(os.getenv("DB_PORT", "3306")),
        db_user=os.getenv("DB_USER", "root"),
        db_password=os.getenv("DB_PASSWORD", ""),
        db_name=os.getenv("DB_NAME", "raktsetu"),
        port=int(os.getenv("AI_PORT", "5001")),
        internal_api_secret=os.getenv("INTERNAL_API_SECRET", "super_secret_internal_token_2026")
    )
