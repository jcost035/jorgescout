import os
from sqlalchemy.pool import NullPool

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:012106@localhost/jorgescout')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SCHEDULER_API_ENABLED = True
    SQLALCHEMY_ENGINE_OPTIONS = {'poolclass': NullPool, "connect_args": {"sslmode": "disable"}}