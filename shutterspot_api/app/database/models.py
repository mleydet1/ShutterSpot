from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date, DateTime, JSON, Text, LargeBinary, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

# Association table for photo favorites
photo_favorites = Table('photo_favorites',
    Base.metadata,
    Column('photo_id', Integer, ForeignKey('photos.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('created_at', DateTime, server_default=func.now())
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    role = Column(String, default="user")
    settings = Column(JSON, default={})
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    activities = relationship("Activity", back_populates="user")
    tasks = relationship("Task", back_populates="assigned_user")
    drive_connections = relationship("DriveConnection", back_populates="user")
    favorited_photos = relationship("Photo", secondary=photo_favorites, back_populates="favorited_by")


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    address = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    shoots = relationship("Shoot", back_populates="client")
    proposals = relationship("Proposal", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")
    galleries = relationship("Gallery", back_populates="client")


class Shoot(Base):
    __tablename__ = "shoots"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    title = Column(String, index=True)
    date = Column(Date)
    start_time = Column(String)
    end_time = Column(String)
    location = Column(String)
    type = Column(String, nullable=True)
    package = Column(String, nullable=True)
    status = Column(String, default="Scheduled")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    client = relationship("Client", back_populates="shoots")
    invoices = relationship("Invoice", back_populates="shoot")
    galleries = relationship("Gallery", back_populates="shoot")


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    title = Column(String, index=True)
    packages = Column(JSON)
    valid_until = Column(Date, nullable=True)
    amount = Column(Float)
    status = Column(String, default="Pending")
    message = Column(Text, nullable=True)
    expiry_date = Column(Date, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    client = relationship("Client", back_populates="proposals")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    shoot_id = Column(Integer, ForeignKey("shoots.id"), nullable=True)
    invoice_number = Column(String, unique=True, index=True)
    items = Column(JSON)
    subtotal = Column(String)
    tax = Column(String)
    total = Column(String)
    due_date = Column(Date)
    amount = Column(Float)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    client = relationship("Client", back_populates="invoices")
    shoot = relationship("Shoot", back_populates="invoices")


class Gallery(Base):
    __tablename__ = "galleries"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    shoot_id = Column(Integer, ForeignKey("shoots.id"), nullable=True)
    title = Column(String, index=True)
    description = Column(Text)
    password = Column(String)
    expiry_date = Column(Date, nullable=True)
    images = Column(JSON)
    status = Column(String, default="Active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    client = relationship("Client", back_populates="galleries")
    shoot = relationship("Shoot", back_populates="galleries")
    photos = relationship("Photo", back_populates="gallery", cascade="all, delete-orphan")
    drive_connections = relationship("DriveConnection", back_populates="gallery", cascade="all, delete-orphan")


class EmailTemplate(Base):
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    subject = Column(String)
    body = Column(Text)
    category = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    triggers = Column(JSON)
    actions = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    due_date = Column(Date)
    priority = Column(String, default="Medium")
    status = Column(String, default="Todo")
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    assigned_user = relationship("User", back_populates="tasks")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    description = Column(Text)
    timestamp = Column(DateTime, server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    entity_id = Column(Integer, nullable=True)
    entity_type = Column(String, nullable=True)

    user = relationship("User", back_populates="activities")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    gallery_id = Column(Integer, ForeignKey("galleries.id"))
    filename = Column(String, nullable=False)
    drive_file_id = Column(String, nullable=True)  # Google Drive file ID
    drive_modified = Column(String, nullable=True)  # Google Drive modified time
    thumbnail = Column(LargeBinary, nullable=True)  # Stored thumbnail image
    url = Column(String, nullable=True)  # URL to the full-size image
    favorites_count = Column(Integer, default=0)  # Counter for favorites
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    gallery = relationship("Gallery", back_populates="photos")
    favorited_by = relationship("User", secondary=photo_favorites, back_populates="favorited_photos")


class DriveConnection(Base):
    __tablename__ = "drive_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    gallery_id = Column(Integer, ForeignKey("galleries.id"))
    drive_folder_id = Column(String, nullable=False)  # Google Drive folder ID
    drive_folder_name = Column(String, nullable=True)  # Google Drive folder name
    auto_sync = Column(Boolean, default=True)  # Whether to auto-sync
    last_synced = Column(DateTime, nullable=True)  # Last time the folder was synced
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="drive_connections")
    gallery = relationship("Gallery", back_populates="drive_connections")
