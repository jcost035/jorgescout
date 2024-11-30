from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from flask import current_app
from server.extensions import db, dexcom
from server.models import Reading
from math import sqrt

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
        return

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
        return gap_start_time < reading.datetime < gap_end_time
        
    filtered_readings = list(filter(date_range_filter, readings))

    for reading in reversed(filtered_readings):
        with app.app_context():
            try:
                reading_entry = Reading(value=reading.value, time=reading.datetime, trendArrow=reading.trend_arrow)
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

def get_time_in_range():
    with current_app.app_context():
        query = db.select(func.count()).select_from(Reading)
        reading_count = db.session.execute(query).scalar_one() 
    
        high = db.session.execute(db.select(func.count()).where(Reading.value > 180)).scalar_one()
        in_range = db.session.execute(db.select(func.count()).where((50 < Reading.value) & (Reading.value < 180))).scalar_one()
        low = db.session.execute(db.select(func.count()).where(Reading.value < 50)).scalar_one()
    
    return {
        'in-range': round(in_range / reading_count * 100),
        'high': round(high / reading_count * 100),
        'low': round(low / reading_count * 100)
    }

def get_average_glucose():
    with current_app.app_context():
        query = db.select(func.count()).select_from(Reading)
        reading_count = db.session.execute(query).scalar_one() 

        query = db.select(Reading).order_by(Reading.time.asc()).limit(1)
        start_reading = db.session.execute(query).scalar_one_or_none()

        reading_sum = db.session.execute(db.select(func.sum(Reading.value))).scalar_one()
    
    return {
        'average glucose': round(reading_sum / reading_count, 2),
        'range-start-date': str(start_reading.time)
        }

def get_a1c():
    average_glucose = get_average_glucose()["average glucose"]

    a1c = (average_glucose + 46.7) / 28.7

    return round(a1c, 1)

def get_standard_deviation():
    average = get_average_glucose()["average glucose"]

    query = db.select(func.count()).select_from(Reading)
    reading_count = db.session.execute(query).scalar_one() 

    #with current_app.app_context():
    query = db.select(Reading)
    readings = db.session.execute(query).scalars()

    square_sum = 0
    for reading in readings:
        difference = reading.value - average
        square = difference * difference
        square_sum += square
    
    variance = square_sum / reading_count

    standard_deviation = sqrt(variance)

    return round(standard_deviation)
        


