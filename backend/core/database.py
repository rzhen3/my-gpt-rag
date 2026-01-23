from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo = True
)

# setup factory for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():

    db = SessionLocal()     # instantiate a new session
    try:
        yield db
    finally:
        db.close()