from services.db import ping_database


def health_check() -> tuple[dict, int]:
    db_ok = False
    try:
        db_ok = ping_database()
    except Exception:
        db_ok = False

    status = "ok" if db_ok else "degraded"
    http_status = 200 if db_ok else 503

    return (
        {
            "status": status,
            "database": "connected" if db_ok else "unavailable",
        },
        http_status,
    )
