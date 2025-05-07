from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Concert(Base):
    __tablename__ = 'concerts'

    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    artist = Column(String(100), nullable=False)
    date = Column(DateTime, nullable=False)
    venue = Column(String(200), nullable=False)
    description = Column(String(500))
    price = Column(Float, nullable=False)
    available_seats = Column(Integer, nullable=False)
    
    tickets = relationship("Ticket", back_populates="concert")

class Ticket(Base):
    __tablename__ = 'tickets'

    id = Column(Integer, primary_key=True)
    concert_id = Column(Integer, ForeignKey('concerts.id'))
    user_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    
    concert = relationship("Concert", back_populates="tickets")

# データベースの作成
engine = create_engine('sqlite:///concerts.db')
Base.metadata.create_all(engine) 