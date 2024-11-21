from flask import Flask
from server.extensions import db, scheduler
from server.config import Config
from server.routes import register_routes
from server.tasks import take_reading, fill_in_gaps
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    scheduler.init_app(app)

    Migrate(app, db)

    scheduler.add_job(func=lambda:take_reading(app), trigger="interval", minutes=5, id="take_reading")
    scheduler.add_job(func=lambda:fill_in_gaps(app), trigger="interval", minutes=24, id="fill_in_gaps")

    scheduler.start()

    with app.app_context():
        db.create_all()

    register_routes(app)

    return app
