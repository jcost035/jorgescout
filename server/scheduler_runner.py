from threading import Event

from . import create_app, start_scheduler
from .extensions import scheduler


def main():
    app = create_app()
    start_scheduler(app)

    try:
        Event().wait()
    except KeyboardInterrupt:
        scheduler.shutdown()


if __name__ == "__main__":
    main()
