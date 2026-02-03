"""
setup demo data for testing. run once to create a demo user and conversation
"""

from core.database import SessionLocal
from modules.storage.models import User, Conversation

def setup_demo_data():
    db = SessionLocal()

    try:
        demo_user = db.query(User).filter(User.id == 1).first()

        if not demo_user:
            print("Creating demo user...")
            demo_user = User(
                name="Demo User",
                email="demo@example.com"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"Created demo user: {demo_user.id}")
        else:
            print(f"Demo user already exists: {demo_user.id}")

        # check if demo conversation exists
        demo_conv = db.query(Conversation).filter(Conversation.id == 1).first()

        if not demo_conv:
            print("Creating demo conversation...")
            demo_conv = Conversation(
                user_id=demo_user.id,
                title="Demo Conversation"
            )
            db.add(demo_conv)
            db.commit()
            db.refresh(demo_conv)
            print(f"Finished creating demo conversation: {demo_conv.id}")
        else:
            print(f"Demo conversation already exists: {demo_conv.id}")
        print("\n Demo data setup complete!")

    except Exception as e:
        print(f"Error setting up demo data: {e}")
        db.rollback()
    finally:
        db.close()
if __name__ == "__main__":
    setup_demo_data()