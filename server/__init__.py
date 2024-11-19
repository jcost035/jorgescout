from flask import Flask
from extensions import db, scheduler
from config import Config
from routes import register_routes
from tasks import take_reading, fill_in_gaps

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    #init extensions
    db.init_app(app)
    scheduler.init_app(app)

    scheduler.add_job(func=take_reading, trigger="interval", minutes=5, id="take_reading")
    scheduler.add_job(func=fill_in_gaps, trigger="interval", hours=24, id="fill_in_gaps")

    scheduler.start()

    with app.app_context():
        db.create_all()

    # Register routes
    register_routes(app)

    return app
