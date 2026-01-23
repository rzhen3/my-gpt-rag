from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    """
    test user in the system.
    each user can create multiple conversations
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)

    # user profile information
    name = Column(String(100), nullable = False)
    email = Column(String(255), unique = True, nullable = False, index = True)

    # timestamps
    created_at = Column(DateTime(timezone = True), server_default = func.now())
    updated_at = Column(DateTime(timezone = True), onupdate = func.now())

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"