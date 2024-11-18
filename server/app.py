from flask import Flask, jsonify
from pydexcom import Dexcom
from apscheduler.schedulers.background import BackgroundScheduler
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:012106@localhost/jorgescout"
db = SQLAlchemy(app)

scheduler = BackgroundScheduler()

dexcom = Dexcom(username="jorge.costa5633@gmail.com", password="012106J-c")
global latest_reading

class Reading(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[int]
    time: Mapped[datetime] = mapped_column(unique=True)

with app.app_context():
    db.create_all()

def take_reading():
    dexcom_reading = dexcom.get_current_glucose_reading()

    try:
        latest_reading = Reading(value=dexcom_reading.value, time=dexcom_reading.datetime)
        db.session.add(latest_reading)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback() 
        print(f"Error: {e.orig}") #log at some point

scheduler.add_job(take_reading, "interval", minutes=5)

def populate_old_readings(time=datetime.now()):
    query = db.select(Reading).where(Reading.time < time and Reading.value is not None).order_by(Reading.time.desc()).limit(1)
    gap_start_reading = db.session.execute(query)

    #if gap > 288? readings then just fill in 288 readings prior to given time
    #else get all readings between gap start time and given time


@app.route('/')
def home():
    dexcom = Dexcom(username="jorge.costa5633@gmail.com", password="012106J-c")
    glucose_reading = dexcom.get_current_glucose_reading()
    history = dexcom.get_glucose_readings()

    return jsonify({'message': glucose_reading.value})

@app.route('/latestreading')
def latest_reading():

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


if __name__ == '__main__':
    app.run(debug=True)
