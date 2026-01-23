"""
setup script to create all database tables. run once to initialize schema
"""

from core.database import engine, Base
from modules.storage.models import User

def create_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind = engine)
    print("Tables created successfully")

if __name__ == "__main__":
    create_tables()