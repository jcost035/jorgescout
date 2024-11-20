from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta
from flask import current_app
from server.extensions import db, dexcom
from server.models import Reading
import pytz

latest_reading = None
gap_end_times = []

def take_reading():
    from run import app

    dexcom_reading = dexcom.get_current_glucose_reading()
    if dexcom_reading is None:
        print("No reading!")  #Log 
        return

    with app.app_context():
        try:
            check_for_gaps(dexcom_reading)
            latest_reading = Reading(value=dexcom_reading.value, time=dexcom_reading.datetime)
            db.session.add(latest_reading)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            print(f"Error: {e.orig}")  #Log 


def populate_old_readings(gap_end_time=datetime.now()):
    from run import app

    query = db.select(Reading).where(
        Reading.time < gap_end_time, Reading.value is not None
    ).order_by(Reading.time.desc()).limit(1)

    with app.app_context():
        gap_start_time = db.session.execute(query).scalar().time

    gap_length = gap_end_time - gap_start_time

    gap_length_minutes = gap_length.total_seconds() / 60
    if gap_length_minutes < 10:
        return

    readings = dexcom.get_glucose_readings()

    gap_end_time = gap_end_time.replace(tzinfo=timezone(timedelta(days=-1, seconds=68400)))
    gap_start_time = gap_start_time.replace(tzinfo=timezone(timedelta(days=-1, seconds=68400)))

    def date_range_filter(reading):
        return gap_start_time <= reading.datetime <= gap_end_time
        
    filtered_readings = list(filter(date_range_filter, readings))

    for reading in reversed(filtered_readings):
        try:
            reading_entry = Reading(value=reading.value, time=reading.datetime)
            with app.app_context():
                db.session.add(reading_entry)
                db.session.commit()
        except IntegrityError as e:
            with app.app_context():
                db.session.rollback()
            print(f"Error writing to db: {e.orig}") #log
        except Exception as e:
            print(f"Unexpected error: {str(e)}") #log

def check_for_gaps(new_latest_reading):
    global latest_reading
    if latest_reading is not None:
        gap_length = new_latest_reading.datetime - latest_reading.time
        gap_length_minutes = gap_length.total_seconds() / 60
        if gap_length_minutes > 15:
            gap_end_times.append(new_latest_reading.time)

def fill_in_gaps():
    for gap_end_time in gap_end_times:
        populate_old_readings(gap_end_time)
    gap_end_times.clear()
