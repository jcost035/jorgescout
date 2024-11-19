from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler
from pydexcom import Dexcom

db = SQLAlchemy()
scheduler = APScheduler()
dexcom = Dexcom(username="jorge.costa5633@gmail.com", password="012106J-c")