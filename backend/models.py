from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from database import Base

class Transcription(Base):
    __tablename__ = "transcriptions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, default="Untitled transcription")
    transcript = Column(Text, nullable=False, default="")
    language = Column(String(80), nullable=False, default="Auto-detected")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
