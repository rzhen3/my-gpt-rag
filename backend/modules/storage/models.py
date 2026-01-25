from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, ARRAY, Boolean, Index
from sqlalchemy.dialects.postgresql.json import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
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

    # setup relationships
    conversations = relationship("Conversation", back_populates="owner", cascade = "all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, email={self.email})>"
    

class Conversation(Base):
    """
    grouping of nodes and their edges.
    """
    __tablename__="conversations"

    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete= "CASCADE"), nullable = False)
    title = Column(String(255), nullable = False)
    created_at = Column(DateTime(timezone = True), server_default=func.now())
    updated_at = Column(DateTime(timezone = True), onupdate = func.now())

    # setup relationships
    owner = relationship("User", back_populates="conversations")
    nodes = relationship("Node", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Conversation(id={self.id}, title={self.title}, user={self.user_id})>"
    


class Node(Base):
    """
    stores all nodes.
    """
    __tablename__ = "nodes"

    id = Column(Integer, primary_key = True, index = True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete = "CASCADE"), nullable = False)

    created_at = Column(DateTime(timezone = True), server_default = func.now())
    ancestor_ids = Column(ARRAY(Integer), default = [], nullable = False)       # for performance optimization

    # for various node types ('prompt', 'document', 'img') TODO: post-MVP
    node_type = Column(String(15), nullable = False)    # 'prompt', 'document', etc (TODO: implement later, only text for now)
    type_data = Column(JSONB, default = {}, nullable = False)
    

        
    prompt_text = Column(Text, nullable = False)
    response_text = Column(Text, nullable = True)
    is_large_content = Column(Boolean, default = False)
    # if this is True, then we simply store a key to GCS or S3 as the prompt text(TODO: post-MVP)

    # each node has one conversation
    conversation = relationship("Conversation", back_populates="nodes")


class Edge(Base):
    """
    stores all edges.
    needed to reconstruct DAG from adjacency list.
    """

    __tablename__ = "edges"

    id = Column(Integer, primary_key = True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"))

    # store exact edges
    source_node_id = Column(Integer, ForeignKey("nodes.id", ondelete = "CASCADE"), nullable = False)
    target_node_id = Column(Integer, ForeignKey("nodes.id", ondelete="CASCADE"), nullable = False)

    __table_args__ = (
        Index('ix_edge_source', 'source_node_id'),  # NOTE: might remove b/c unnecessary overhead
        Index('ix_edge_target', 'target_node_id'),  # NOTE: might remove b/c unnecessary overhead
        Index('ix_edge_conversation', 'conversation_id')
    )

# TODO: consider using a closure table for faster ancestor lookups (graphDB only useful for 100k nodes, and will be just for fun)