import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    flask_env: str
    flask_debug: bool
    secret_key: str
    host: str
    port: int
    db_host: str
    db_port: int
    db_user: str
    db_password: str
    db_name: str
    db_pool_size: int
    db_pool_name: str
    jwt_access_expires_minutes: int
    jwt_refresh_expires_days: int
    otp_expires_minutes: int
    otp_length: int
    ai_service_url: str
    ai_service_timeout: int
    redis_url: str


@lru_cache
def get_settings() -> Settings:
    return Settings(
        flask_env=os.getenv("FLASK_ENV", "development"),
        flask_debug=os.getenv("FLASK_DEBUG", "0") == "1",
        secret_key=os.getenv("SECRET_KEY", "dev-secret-key"),
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "5000")),
        db_host=os.getenv("DB_HOST", "localhost"),
        db_port=int(os.getenv("DB_PORT", "3306")),
        db_user=os.getenv("DB_USER", "root"),
        db_password=os.getenv("DB_PASSWORD", ""),
        db_name=os.getenv("DB_NAME", "raktsetu"),
        db_pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
        db_pool_name=os.getenv("DB_POOL_NAME", "raktsetu_pool"),
        jwt_access_expires_minutes=int(os.getenv("JWT_ACCESS_EXPIRES_MINUTES", "60")),
        jwt_refresh_expires_days=int(os.getenv("JWT_REFRESH_EXPIRES_DAYS", "7")),
        otp_expires_minutes=int(os.getenv("OTP_EXPIRES_MINUTES", "5")),
        otp_length=int(os.getenv("OTP_LENGTH", "6")),
        ai_service_url=os.getenv("AI_SERVICE_URL", "http://127.0.0.1:5001"),
        ai_service_timeout=int(os.getenv("AI_SERVICE_TIMEOUT", "10")),
        redis_url=os.getenv("REDIS_URL", ""),
    )
