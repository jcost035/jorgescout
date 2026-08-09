from flask import Flask
from .extensions import db, scheduler
from .routes import register_routes
from .config import Config
from .tasks import take_reading, populate_daily_time_in_range
from flask_migrate import Migrate
from flask_cors import CORS 


def start_scheduler(app):
    if scheduler.running:
        return

    scheduler.add_job(
        func=lambda: take_reading(app),
        trigger="interval",
        minutes=5,
        id="take_reading",
        max_instances=1,
        coalesce=True,
        replace_existing=True,
    )
    scheduler.add_job(
        func=lambda: populate_daily_time_in_range(app),
        trigger="cron",
        hour=0,
        minute=10,
        id="populate_daily_tir",
        max_instances=1,
        coalesce=True,
        replace_existing=True,
    )

    populate_daily_time_in_range(app)
    scheduler.start()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app) #specify resources parameter in production
    
    db.init_app(app)
    scheduler.init_app(app)

    Migrate(app, db)

    with app.app_context():
        db.create_all()

    register_routes(app)

    return app
