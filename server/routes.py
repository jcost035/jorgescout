from flask import Flask, jsonify, Blueprint
from pydexcom import Dexcom
from apscheduler.schedulers.background import BackgroundScheduler
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from server.models import Reading
from server.extensions import db

bp = Blueprint('api', __name__)

@bp.route('/', methods=['GET'])
def home():
    dexcom = Dexcom(username="jorge.costa5633@gmail.com", password="012106J-c")
    glucose_reading = dexcom.get_current_glucose_reading()
    history = dexcom.get_glucose_readings()

    return jsonify({
        'latest_reading': history[0].value,
         'time': history[0].datetime
        })

@bp.route('/latestreading', methods=['GET'])
def latest_reading_route():

    if latest_reading is not None: #and the reading isn't stale?? 
        return jsonify({
            'value': latest_reading.value,
            'time': latest_reading.time
        })
  
    try:
        latest_reading = db.session.execute(db.select(Reading).order_by(Reading.time.desc).limit(1)).scalar_one_or_none()
    except Exception as e:
        print(f"Database error: {str(e)}") #log
        return jsonify({'error': 'There was an error retrieving the latest record'})

    if latest_reading is not None:
        return jsonify({
            'value': latest_reading.value,
            'time': latest_reading.time
        })
    else:
        return jsonify({'error': 'There was an error retrieving the latest record'})
    
def register_routes(app):
    app.register_blueprint(bp)

