from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .extensions import db

class Reading(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[int]
    time: Mapped[datetime] = mapped_column(unique=True)
    trendArrow: Mapped[str] = mapped_column(nullable=True)

class dailyTimeInRange(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    timeInRange: Mapped[int]
    date: Mapped[datetime] = mapped_column(unique=True)
    date_recorded: Mapped[datetime] = mapped_column(unique=True) #please make this mf camel case!!!
    timeHigh: Mapped[int]
    timeLow: Mapped[int]