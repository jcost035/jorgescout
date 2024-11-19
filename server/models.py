from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from extensions import db

class Reading(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[int]
    time: Mapped[datetime] = mapped_column(unique=True)