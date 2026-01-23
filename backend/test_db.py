from core.database import SessionLocal
from modules.storage.models import User

def test_create_user():

    db = SessionLocal()

    try:
        new_user = User(
            name = "alice",
            email="alice@mail.com"
        )

        # add to session and commit
        db.add(new_user)
        db.commit()

        # refresh to see id
        db.refresh(new_user)

        print(f"   Created user: {new_user}")
        print(f"   ID: {new_user.id}")
        print(f"   Name: {new_user.name}")
        print(f"   Email: {new_user.email}")
        print(f"   Created at: {new_user.created_at}")

    except Exception as e:
        print(f"error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_create_user()