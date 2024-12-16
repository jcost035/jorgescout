from flask import jsonify, Blueprint, current_app, Response
from pydexcom import Dexcom
from .models import Reading, dailyTimeInRange
from .extensions import db
from .tasks import  get_average_glucose, get_a1c, get_standard_deviation
from datetime import datetime
import time
import json


bp = Blueprint('api', __name__)

@bp.route('/', methods=['GET'])
def home():
    dexcom = Dexcom(username="jorge.costa5633@gmail.com", password="012106J-c")
    glucose_reading = dexcom.get_current_glucose_reading()
    history = dexcom.get_glucose_readings()

    #idea: check to make sure latest reading was over 5 mins ago before pinging dexcom servers, if it was under use last reading
    #or something idk that might not actually be right because at that point you could always just query the db for last reading
    #same thing. no wait actually not same becaused datetime attribute represents time reading was taken by device not time
    #when it was added to db so yeah maybe should do it but probably minimal impact on performance anyway. 
    #but maybe we want to set up some local storage on front end so its not pinging db for current reading every time
    #the app is opened

    return jsonify({
        'latest_reading': history[0].value,
         'time': history[0].datetime,
         'trend_arrow': history[0].trend_arrow
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
        print(f"Database exception: {str(e)}") #log
        return jsonify({'error': 'There was an error retrieving the latest record'})

    if latest_reading is not None:
        return jsonify({
            'value': latest_reading.value,
            'time': latest_reading.time
        })
    else:
        return jsonify({'error': 'There was an error retrieving the latest record'})
    
@bp.route('/history/<int:reading_count>', methods=['GET'])
def history_route(reading_count=10):
    dexcom = Dexcom(username="jorge.costa5633@gmail.com", password="012106J-c")
    history = dexcom.get_glucose_readings(max_count=reading_count)

    def to_json(reading):
        return reading.json
    
    def create_js_date_string(dt):
        return dt.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    
    def date_string_conversion(reading):
        time = datetime.utcfromtimestamp(int(reading["ST"][5:-4]))

        reading["TimeString"] = create_js_date_string(time)
        reading["Hour"] = time.hour
        reading["Minute"] = time.minute


    history_list = list(map(to_json, history))

    histroy_list = list(map(date_string_conversion, history_list))

    return jsonify({
        'history': history_list
    })

@bp.route('/history/minutes/<int:minutes>', methods=['GET'])
def history_minutes_route(minutes=60):
    dexcom = Dexcom(username="jorge.costa5633@gmail.com", password="012106J-c")
    history = dexcom.get_glucose_readings(minutes=minutes)

    def to_json(reading):
        return reading.json
    
    def create_js_date_string(dt):
        return dt.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    
    def date_string_conversion(reading):
        time = datetime.utcfromtimestamp(int(reading["ST"][5:-4]))

        reading["TimeString"] = create_js_date_string(time)
        reading["Hour"] = time.hour
        reading["Minute"] = time.minute


    history_list = list(map(to_json, history))

    histroy_list = list(map(date_string_conversion, history_list))

    return jsonify({
        'history': history_list
    })

    
@bp.route('/stats', methods=['GET'])
def stats():
    return jsonify({
        'time in range': get_time_in_range(), 
        'average': get_average_glucose(), 
        'a1c' : get_a1c(), 
        'standard deviation': get_standard_deviation()
    })

@bp.route('/testhigh', methods=['GET'])
def test_high():
    return jsonify({
            'latest_reading': 190,
            'time': datetime.now(),
            'trend_arrow': ''
        })

@bp.route('/getdailytir/<int:tir_count>', methods=['GET'])
def get_daily_tir(tir_count=30):
    query = db.select(dailyTimeInRange).order_by(dailyTimeInRange.id.desc()).limit(tir_count)
    tir_values = db.session.execute(query).scalars()
    
    def to_json(tir):
        return {'timeInRange':tir.timeInRange, 'high': tir.timeHigh, 'low': tir.timeLow, 'date': tir.date}

    tir_list = list(map(to_json, tir_values))

    return jsonify(tir_list)

    
def register_routes(app):
    app.register_blueprint(bp)


