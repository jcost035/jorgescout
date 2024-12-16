from flask import Flask
from .extensions import db, scheduler
from .config import Config
from .routes import register_routes
from .tasks import take_reading, fill_in_gaps
from flask_migrate import Migrate
from flask_cors import CORS 

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app) #specify resources parameter in production

    db.init_app(app)
    scheduler.init_app(app)

    Migrate(app, db)

    scheduler.add_job(func=lambda:take_reading(app), trigger="interval", minutes=5, id="take_reading")
    #scheduler.add_job(func=lambda:fill_in_gaps(app), trigger="interval", minutes=24, id="fill_in_gaps")
    # scheduler.add_job(func=lambda:populate_daily_time_in_range(app), trigger='cron', hour=0, minute=10, id="populate daily tir")

    populate_daily_time_in_range(app)

    scheduler.start()

    with app.app_context():
        db.create_all()

    register_routes(app)

    return app
