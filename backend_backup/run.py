from app import create_app, shutdown_app
from config.settings import get_settings

app = create_app()


if __name__ == "__main__":
    settings = get_settings()
    try:
        app.run(host=settings.host, port=settings.port, debug=settings.flask_debug)
    finally:
        shutdown_app(app)
