from sqlalchemy.exc import IntegrityError
from datetime import datetime
from flask import current_app
from extensions import db, dexcom
from models import Reading

latest_reading = None
gap_end_times = []

def take_reading():
    from run import app

    dexcom_reading = dexcom.get_current_glucose_reading()
    if dexcom_reading is None:
        print("No reading!")  # Log this
        return

    with app.app_context():
        try:
            check_for_gaps(dexcom_reading)
            latest_reading = Reading(value=dexcom_reading.value, time=dexcom_reading.datetime)
            db.session.add(latest_reading)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            print(f"Error: {e.orig}")  # Log error

def populate_old_readings(gap_end_time=datetime.now()):
    query = db.select(Reading).where(
        Reading.time < gap_end_time, Reading.value is not None
    ).order_by(Reading.time.desc()).limit(1)

    gap_start_reading = db.session.execute(query).scalar()
    seconds_in_a_day = 24 * 60 * 60
    difference = gap_end_time - gap_start_reading.time

    difference_in_minutes = difference.total_seconds() / 60
    if difference_in_minutes < 10:
        return

    readings = (
        dexcom.get_glucose_readings()
        if difference.total_seconds() > seconds_in_a_day
        else dexcom.get_glucose_readings(minutes=round(difference_in_minutes))
    )

    if readings:
        for reading in readings:
            try:
                reading_entry = Reading(value=reading.value, time=reading.datetime)
                with current_app.app_context():
                    db.session.add(reading_entry)
                    db.session.commit()
            except IntegrityError as e:
                with current_app.app_context():
                    db.session.rollback()
                print(f"Error writing to db: {e.orig}")
            except Exception as e:
                print(f"Unexpected error: {str(e)}")

def check_for_gaps(new_latest_reading):
    global latest_reading
    if latest_reading is not None:
        difference = new_latest_reading.datetime - latest_reading.time
        difference_in_minutes = difference.total_seconds() / 60
        if difference_in_minutes > 15:
            gap_end_times.append(new_latest_reading.time)

def fill_in_gaps():
    for gap_end_time in gap_end_times:
        populate_old_readings(gap_end_time)
    gap_end_times.clear()
