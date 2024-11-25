from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta
from flask import current_app
from server.extensions import db, dexcom
from server.models import Reading

latest_reading = None
gap_end_times = []

def take_reading(app):
    try:
        dexcom_reading = dexcom.get_current_glucose_reading()

        if dexcom_reading is None:
            print("No reading!")  #Log 
            return
        
    except Exception as e:
        print(f"Exception: {str(e)}") #log

    with app.app_context():
        try:
            check_for_gaps(app, Reading(value=dexcom_reading.value, time=dexcom_reading.datetime))
            latest_reading = Reading(value=dexcom_reading.value, time=dexcom_reading.datetime, trendArrow=dexcom_reading.trend_arrow)
            db.session.add(latest_reading)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            print(f"Exception: {e.orig}")  #Log 


def populate_old_readings(app, gap_end_time=datetime.now()):

    query = db.select(Reading).where(
        Reading.time < gap_end_time, Reading.value is not None
    ).order_by(Reading.time.desc()).limit(1)

    with app.app_context():
        gap_start_time = db.session.execute(query).scalar().time

    gap_end_time = gap_end_time.replace(tzinfo=timezone(timedelta(days=-1, seconds=68400)))
    gap_start_time = gap_start_time.replace(tzinfo=timezone(timedelta(days=-1, seconds=68400)))

    gap_length = gap_end_time - gap_start_time

    gap_length_minutes = gap_length.total_seconds() / 60
    if gap_length_minutes < 10:
        return

    readings = dexcom.get_glucose_readings()

    def date_range_filter(reading):
        return gap_start_time <= reading.datetime <= gap_end_time
        
    filtered_readings = list(filter(date_range_filter, readings))

    for reading in reversed(filtered_readings):
        with app.app_context():
            try:
                reading_entry = Reading(value=reading.value, time=reading.datetime)
                db.session.add(reading_entry)
                db.session.commit()
            except IntegrityError as e:
                db.session.rollback()
                print(f"Error writing to db: {e.orig}") #log
            except Exception as e:
                print(f"Error: {str(e)}") #log

def check_for_gaps(app, new_latest_reading):
    global latest_reading

    with app.app_context():
        if latest_reading is None:
            query = db.select(Reading).order_by(Reading.time.desc()).limit(1)
            latest_reading = db.session.execute(query).scalar_one_or_none()

    latest_reading.time = latest_reading.time.replace(tzinfo=timezone(timedelta(days=-1, seconds=68400)))
    new_latest_reading.time = new_latest_reading.time.replace(tzinfo=timezone(timedelta(days=-1, seconds=68400)))

    if latest_reading is not None:
        gap_length = new_latest_reading.time - latest_reading.time
        gap_length_minutes = gap_length.total_seconds() / 60
        if gap_length_minutes > 15:
            gap_end_times.append(new_latest_reading.time)
            populate_old_readings(app, new_latest_reading.time)

def fill_in_gaps(app):
    for gap_end_time in gap_end_times:
        populate_old_readings(app, gap_end_time)
    gap_end_times.clear()