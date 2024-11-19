from flask import Flask
from server.extensions import db, scheduler
from server.config import Config
from server.routes import register_routes
from server.tasks import take_reading, fill_in_gaps
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    #init extensions
    db.init_app(app)
    scheduler.init_app(app)

    migrate = Migrate(app, db)

    scheduler.add_job(func=take_reading, trigger="interval", minutes=5, id="take_reading")
    scheduler.add_job(func=fill_in_gaps, trigger="interval", hours=24, id="fill_in_gaps")

    scheduler.start()

    with app.app_context():
        db.create_all()

    # Register routes
    register_routes(app)

    return app
