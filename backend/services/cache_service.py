"""In-memory cache with optional Redis backend."""

from __future__ import annotations

import json
import time
from typing import Any, Optional

from config.settings import get_settings

_memory_cache: dict[str, tuple[float, Any]] = {}
_redis_client = None
_redis_checked = False


def _get_redis():
    global _redis_client, _redis_checked
    if _redis_checked:
        return _redis_client

    _redis_checked = True
    settings = get_settings()
    if not settings.redis_url:
        return None

    try:
        import redis

        _redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        _redis_client.ping()
    except Exception:
        _redis_client = None
    return _redis_client


def cache_get(key: str) -> Any | None:
    client = _get_redis()
    if client:
        raw = client.get(key)
        if raw is None:
            return None
        return json.loads(raw)

    entry = _memory_cache.get(key)
    if not entry:
        return None
    expires_at, value = entry
    if time.time() > expires_at:
        _memory_cache.pop(key, None)
        return None
    return value


def cache_set(key: str, value: Any, ttl_seconds: int) -> None:
    client = _get_redis()
    if client:
        client.setex(key, ttl_seconds, json.dumps(value, default=str))
        return

    _memory_cache[key] = (time.time() + ttl_seconds, value)
