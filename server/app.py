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
gap_end_times = []

class Reading(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[int]
    time: Mapped[datetime] = mapped_column(unique=True)

with app.app_context():
    db.create_all()

def take_reading():
    dexcom_reading = dexcom.get_current_glucose_reading()

    try:
        check_for_gaps(dexcom_reading)
        latest_reading = Reading(value=dexcom_reading.value, time=dexcom_reading.datetime)
        db.session.add(latest_reading)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback() 
        print(f"Error: {e.orig}") #log at some point

scheduler.add_job(take_reading, "interval", minutes=5)

def populate_old_readings(gap_end_time=datetime.now()):
    query = db.select(Reading).where(Reading.time < gap_end_time and Reading.value is not None).order_by(Reading.time.desc()).limit(1)
    gap_start_reading = db.session.execute(query)

    seconds_in_a_day = 24 * 60 * 60
    difference = gap_end_time - gap_start_reading.time 

    if difference.total_seconds() > seconds_in_a_day:
        readings = dexcom.get_glucose_readings() #gets the last 24 hours of readings
    else:
        difference_in_minutes = round(difference.total_seconds() / 60)
        readings = dexcom.get_glucose_readings(minutes=difference_in_minutes)
    
    if readings is not None and len(readings) > 0:
            for reading in readings:
                try:
                    reading_entry = Reading(value=reading.value, time=reading.datetime)
                    db.session.add(reading_entry)
                    db.session.commit()
                except IntegrityError as e:
                    db.session.rollback()
                    print(f"Error, failed to write record to db: {e.orig}")
                except Exception as e:
                    print(f"Error: {str(e)}")


def check_for_gaps(new_latest_reading):
    if latest_reading is not None:
        difference = new_latest_reading.datetime - latest_reading.time
        difference_in_minutes = difference.total_seconds() / 60
        if difference_in_minutes > 15:
            gap_end_times.add(new_latest_reading.time)

def fill_in_gaps():
    for gap_end_time in gap_end_times:
        populate_old_readings(gap_end_time)
    gap_end_times = []


scheduler.add_job(fill_in_gaps, "interval", hours=24)


@app.route('/')
def home():
    dexcom = Dexcom(username="jorge.costa5633@gmail.com", password="012106J-c")
    glucose_reading = dexcom.get_current_glucose_reading()
    history = dexcom.get_glucose_readings()

    return jsonify({
        'latest_reading': history[0].value,
         'time': history[0].datetime
        })

@app.route('/latestreading')
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


if __name__ == '__main__':
    app.run(debug=True)
