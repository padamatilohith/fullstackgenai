import os
import json
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from database import Base, engine, get_db
from models import Transcription
from schemas import TranscriptionCreate, TranscriptionUpdate, TranscriptionOut
from speech_service import transcribe_audio

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Procucev Speech-to-Text API", version="1.0.0")
origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(CORSMiddleware, allow_origins=[origin, "http://localhost:5173", "http://localhost:3000"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "speech-to-text"}

@app.get("/api/transcriptions", response_model=list[TranscriptionOut])
def list_transcriptions(db: Session = Depends(get_db)):
    return db.query(Transcription).order_by(Transcription.created_at.desc()).all()

@app.post("/api/transcriptions", response_model=TranscriptionOut, status_code=201)
def create_transcription(payload: TranscriptionCreate, db: Session = Depends(get_db)):
    item = Transcription(title=payload.title.strip() or "Untitled transcription",
                         transcript=payload.transcript.strip(), language=payload.language)
    db.add(item); db.commit(); db.refresh(item)
    return item

@app.get("/api/transcriptions/{item_id}", response_model=TranscriptionOut)
def get_transcription(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Transcription).filter(Transcription.id == item_id).first()
    if not item: raise HTTPException(404, "Transcription not found")
    return item

@app.put("/api/transcriptions/{item_id}", response_model=TranscriptionOut)
def update_transcription(item_id: int, payload: TranscriptionUpdate, db: Session = Depends(get_db)):
    item = db.query(Transcription).filter(Transcription.id == item_id).first()
    if not item: raise HTTPException(404, "Transcription not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if value is not None: setattr(item, key, value.strip() if isinstance(value, str) else value)
    db.commit(); db.refresh(item)
    return item

@app.delete("/api/transcriptions/{item_id}")
def delete_transcription(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Transcription).filter(Transcription.id == item_id).first()
    if not item: raise HTTPException(404, "Transcription not found")
    db.delete(item); db.commit()
    return {"message": "Transcription deleted", "id": item_id}

@app.websocket("/ws/transcribe")
async def live_transcribe(websocket: WebSocket):
    await websocket.accept()
    audio_buffer = bytearray()
    chunk_bytes = 16000 * 4 * 4  # 4 seconds, mono float32 @ 16 kHz
    language = "Auto-detected"
    try:
        await websocket.send_json({"type": "ready", "message": "Microphone connected"})
        while True:
            message = await websocket.receive()
            if message.get("bytes") is not None:
                audio_buffer.extend(message["bytes"])
                while len(audio_buffer) >= chunk_bytes:
                    raw = bytes(audio_buffer[:chunk_bytes])
                    del audio_buffer[:chunk_bytes]
                    audio = np.frombuffer(raw, dtype=np.float32).copy()
                    text, language = await run_in_threadpool(transcribe_audio, audio)
                    if text:
                        await websocket.send_json({"type": "transcript", "text": text, "language": language, "final": True})
            elif message.get("text"):
                command = json.loads(message["text"])
                if command.get("action") == "stop":
                    if len(audio_buffer) >= 16000 * 4 // 2:
                        usable = len(audio_buffer) - (len(audio_buffer) % 4)
                        audio = np.frombuffer(bytes(audio_buffer[:usable]), dtype=np.float32).copy()
                        text, language = await run_in_threadpool(transcribe_audio, audio)
                        if text:
                            await websocket.send_json({"type": "transcript", "text": text, "language": language, "final": True})
                    await websocket.send_json({"type": "stopped"})
                    break
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        try: await websocket.send_json({"type": "error", "message": str(exc)})
        except Exception: pass
    finally:
        try: await websocket.close()
        except Exception: pass
