"""
verify that conversation, node, edge models work
"""

from core.database import SessionLocal
from modules.storage.models import User, Conversation, Node

def test_create_conversation():

    db = SessionLocal()

    try:

        # create user
        user = User(name = "bob", email="bob.123@gmail.com")
        db.add(user)
        db.commit()
        db.refresh(user)    # user receives 'id' after refresh()
        
        # create conversation for this user
        conversation = Conversation(
            user_id = 30,
            title = "first convo"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        print(conversation)

    except Exception as e:
        print(f"error: {e}")
        db.rollback()

    finally:
        db.close()



if __name__ == "__main__":
    test_create_conversation()