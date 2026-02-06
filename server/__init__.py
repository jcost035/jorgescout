from dotenv import load_dotenv
import os
from flask import Flask
from .extensions import db, scheduler
from .routes import register_routes
from .config import Config
from .tasks import take_reading, populate_daily_time_in_range
from flask_migrate import Migrate
from flask_cors import CORS 

load_dotenv()

def _init_scheduler(app):
    scheduler.add_job(
        func=lambda: take_reading(app),
        trigger="interval",
        minutes=5,
        id="take_reading"
    )
    
    scheduler.add_job(
        func=lambda: populate_daily_time_in_range(app),
        trigger="cron",
        hour=0,
        minute=10,
        id="populate_daily_tir"
    )

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    
    db.init_app(app)
    scheduler.init_app(app)
    
    Migrate(app, db)
    
    _init_scheduler(app)

    with app.app_context():
        db.create_all()
        populate_daily_time_in_range(app)

    register_routes(app)
    
    if not scheduler.running:
        scheduler.start()

    return app

