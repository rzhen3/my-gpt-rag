import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from modules.storage.models import User, Conversation, Node, Edge
from core.database import Base

from .config import settings

"""
Simple tests for basic database operability. Not meant to be comprehensive.
"""

@pytest.fixture(scope = "function")
def db_session():
    """
    create fresh db for test.
    auto rollback after completion
    """

    engine = create_engine(settings.DATABASE_URL)

    Base.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    yield session

    session.close()
    Base.metadata.drop_all(engine)

# test 1: user creation
def test_user_creation(db_session):

    user = User(name="Alice", email="alice@mail.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.name == "Alice"
    assert user.email == "alice@mail.com"
    assert user.created_at is not None

# test 2: email uniqueness for multiple people
def test_user_email_unique(db_session):

    user = User(name="Alice", email = "alice@mail.com")
    db_session.add(user)
    db_session.commit()

    user2 = User(name="Alice2", email = "alice@mail.com")
    db_session.add(user2)

    # check for exception
    with pytest.raises(Exception):
        db_session.commit()

# test 3: users having multiple conversations
def test_user_conversations(db_session):

    user = User(name="Alice", email = "alice@mail.com")
    db_session.add(user)
    db_session.commit()

    conv1 = Conversation(user_id = user.id, title = "alice convo 1")
    conv2 = Conversation(user_id = user.id, title = "alice convo 2")
    db_session.add_all([conv1, conv2])
    db_session.commit()

    # test relationship
    assert len(user.conversations) == 2
    assert user.conversations[0].title == "alice convo 1"

# test 4: ensure convo deleted on user deletion
def test_conversation_cascade_delete(db_session):

    # create and add user to DB
    user = User(name = "alice", email = "alice@mail.com")
    db_session.add(user)
    db_session.commit()

    # create and add conversation to DB
    conv1 = Conversation(user_id = user.id, title = "alice convo 67")
    db_session.add(conv1)
    db_session.commit()

    # create dummy nodes
    node1 = Node(
        conversation_id = conv1.id, 
        node_type = "prompt",
        prompt_text = "how to get better day by day?",
    )

    db_session.add(node1)
    db_session.commit()

    node_id = node1.id
    convo_id = conv1.id

    # delete user
    db_session.delete(user)
    db_session.commit()

    # check node and convo deleted
    deleted_node = db_session.query(Node).filter_by(id = node_id).first()
    assert deleted_node is None
    deleted_convo = db_session.query(Conversation).filter_by(id = convo_id).first()
    assert deleted_convo is None
    