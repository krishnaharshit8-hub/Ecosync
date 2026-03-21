# backend/db/schemas.py
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from .database import Base

class House(Base):
    __tablename__ = 'houses'
    id = Column(String(10), primary_key=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200))
    panel_size_kw = Column(Float, default=5.0)
    battery_kw = Column(Float, default=10.0)
    priority_class = Column(String(20), default='residential')

class EnergyReading(Base):
    __tablename__ = 'energy_readings'
    id = Column(Integer, primary_key=True, index=True)
    house_id = Column(String(10), index=True)
    timestamp = Column(DateTime(timezone=True))
    solar_production_kw = Column(Float)
    consumption_kw = Column(Float)
    battery_soc_percent = Column(Float)
    grid_connected = Column(Boolean, default=True)

class Trade(Base):
    __tablename__ = 'trades'
    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(String(10))
    buyer_id = Column(String(10))
    amount_kw = Column(Float)
    price_per_kwh = Column(Float)
    tx_hash = Column(String(66))
    status = Column(String(20), default='pending')
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Prediction(Base):
    __tablename__ = 'predictions'
    id = Column(Integer, primary_key=True, index=True)
    house_id = Column(String(10))
    predicted_for = Column(DateTime(timezone=True))
    pred_production_kw = Column(Float)
    pred_consumption_kw = Column(Float)
    model_version = Column(String(20), default='lstm_v1')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AgentLog(Base):
    __tablename__ = 'agents_log'
    id = Column(Integer, primary_key=True, index=True)
    house_id = Column(String(10))
    action = Column(String(20))
    reason = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
