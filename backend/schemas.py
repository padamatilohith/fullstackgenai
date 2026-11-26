from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class TranscriptionCreate(BaseModel):
    title: str = Field(default="Untitled transcription", max_length=200)
    transcript: str
    language: str = Field(default="Auto-detected", max_length=80)

class TranscriptionUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    transcript: str | None = None
    language: str | None = Field(default=None, max_length=80)

class TranscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    transcript: str
    language: str
    created_at: datetime
    updated_at: datetime
