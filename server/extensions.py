import os
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler
from pydexcom import Dexcom

db = SQLAlchemy()
scheduler = APScheduler()
dexcom = Dexcom(username=os.getenv('DEXCOM_USERNAME'), password=os.getenv('DEXCOM_PASSWORD'))