import os
from functools import lru_cache
if os.getenv("VERCEL"):
    os.environ.setdefault("HF_HOME", "/tmp/huggingface")
import numpy as np
from faster_whisper import WhisperModel

@lru_cache(maxsize=1)
def get_model():
    size = os.getenv("MODEL_SIZE", "base")
    device = os.getenv("DEVICE", "cpu")
    compute_type = os.getenv("COMPUTE_TYPE", "int8")
    return WhisperModel(size, device=device, compute_type=compute_type)

def transcribe_audio(audio: np.ndarray):
    # Whisper expects mono audio sampled at 16 kHz, normalized float32.
    if audio.size < 16000 // 2:
        return "", "Auto-detected"
    audio = np.asarray(audio, dtype=np.float32)
    model = get_model()
    segments, info = model.transcribe(
        audio,
        beam_size=1,
        vad_filter=True,
        condition_on_previous_text=False,
        task="transcribe",
    )
    text = " ".join(segment.text.strip() for segment in segments).strip()
    language = info.language or "Auto-detected"
    return text, language
