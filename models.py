from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    
    tickets = relationship("Ticket", back_populates="user")

class Concert(Base):
    __tablename__ = 'concerts'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    artist = Column(String, index=True)
    date = Column(DateTime, index=True)
    venue = Column(String)
    description = Column(String)
    price = Column(Float)
    available_seats = Column(Integer)
    
    tickets = relationship("Ticket", back_populates="concert")

class Ticket(Base):
    __tablename__ = 'tickets'

    id = Column(Integer, primary_key=True, index=True)
    concert_id = Column(Integer, ForeignKey('concerts.id'))
    user_id = Column(Integer, ForeignKey("users.id"))
    quantity = Column(Integer)
    total_price = Column(Float)
    purchase_date = Column(DateTime, default=datetime.now)
    
    concert = relationship("Concert", back_populates="tickets")
    user = relationship("User", back_populates="tickets")

# データベースの作成
engine = create_engine('sqlite:///concerts.db')
Base.metadata.create_all(engine) 