"""MySQL connection pool lifecycle and helpers."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator, Optional

import mysql.connector
from mysql.connector import pooling
from mysql.connector.connection import MySQLConnection
from mysql.connector.pooling import MySQLConnectionPool

from config.settings import Settings, get_settings

_pool: Optional[MySQLConnectionPool] = None


def init_pool(settings: Optional[Settings] = None) -> MySQLConnectionPool:
    """Create the global connection pool (idempotent)."""
    global _pool

    if _pool is not None:
        return _pool

    cfg = settings or get_settings()
    _pool = pooling.MySQLConnectionPool(
        pool_name=cfg.db_pool_name,
        pool_size=cfg.db_pool_size,
        pool_reset_session=True,
        host=cfg.db_host,
        port=cfg.db_port,
        user=cfg.db_user,
        password=cfg.db_password,
        database=cfg.db_name,
        autocommit=False,
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci",
        use_unicode=True,
    )
    return _pool


def close_pool() -> None:
    """Release the pool reference on application shutdown."""
    global _pool
    _pool = None


@contextmanager
def get_connection() -> Generator[MySQLConnection, None, None]:
    """Borrow a connection from the pool and return it when done."""
    pool = init_pool()
    connection = pool.get_connection()
    try:
        yield connection
    finally:
        connection.close()


def ping_database() -> bool:
    """Verify that a connection can be acquired and the server responds."""
    with get_connection() as conn:
        conn.ping(reconnect=True, attempts=1, delay=0)
        return True
