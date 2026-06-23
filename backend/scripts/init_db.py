"""Apply database migrations from SQL files."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import mysql.connector
from mysql.connector import errorcode

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from config.settings import get_settings

MIGRATIONS_DIR = BACKEND_ROOT / "migrations"


def _split_schema_statements(sql: str) -> list[str]:
    statements: list[str] = []
    for chunk in sql.split(";"):
        statement = chunk.strip()
        if statement and not statement.startswith("--"):
            statements.append(statement)
    return statements


def _split_trigger_blocks(sql: str) -> list[str]:
    blocks: list[str] = []
    current: list[str] = []

    for line in sql.splitlines():
        if line.strip().startswith("-- @block"):
            if current:
                blocks.append("\n".join(current).strip())
                current = []
            continue
        current.append(line)

    if current:
        blocks.append("\n".join(current).strip())

    return [block for block in blocks if block]


def _execute_statements(cursor, statements: list[str]) -> None:
    for statement in statements:
        try:
            cursor.execute(statement)
        except mysql.connector.Error as exc:
            if exc.errno == errorcode.ER_DUP_KEYNAME:
                continue
            if exc.errno == errorcode.ER_DUP_FIELDNAME:
                continue
            if exc.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                continue
            if exc.errno == errorcode.ER_DUP_ENTRY:
                continue
            if exc.errno == errorcode.ER_FK_DUP_NAME:
                continue
            raise


def run_migrations(files: list[str] | None = None) -> None:
    settings = get_settings()
    migration_files = files or [
        "001_schema.sql",
        "002_triggers.sql",
        "003_auth.sql",
        "004_donor.sql",
        "005_hospital.sql",
        "006_phase5.sql",
    ]

    conn = mysql.connector.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        autocommit=True,
    )

    try:
        cursor = conn.cursor()

        for filename in migration_files:
            sql_path = MIGRATIONS_DIR / filename
            if not sql_path.exists():
                raise FileNotFoundError(f"Migration not found: {sql_path}")

            raw_sql = sql_path.read_text(encoding="utf-8")
            if filename.endswith("triggers.sql"):
                statements = _split_trigger_blocks(raw_sql)
            else:
                statements = _split_schema_statements(raw_sql)

            _execute_statements(cursor, statements)
            print(f"Applied migration: {filename}")

        cursor.close()
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run RaktSetu SQL migrations")
    parser.add_argument(
        "files",
        nargs="*",
        help="Optional migration filenames (default: all)",
    )
    args = parser.parse_args()
    run_migrations(args.files or None)
