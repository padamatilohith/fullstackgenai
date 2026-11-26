# VoxNote — Real-time Speech to Text

A full-stack speech-to-text MVP prepared for the Procucev AI Tech hiring assignment.

## Features
- Browser microphone capture and near-real-time transcription over WebSocket
- Self-hosted Faster-Whisper model; auto language detection for multilingual speech
- Hindi, English, and code-mixed speech support (model accuracy varies by audio quality)
- MySQL persistence using SQLAlchemy
- Transcription history with search, create, edit, copy, and delete
- Responsive React dashboard
- Docker Compose for MySQL + backend

## Stack
React + Vite + Bootstrap | FastAPI + WebSocket | Faster-Whisper | SQLAlchemy | MySQL

## Run locally (development)

### 1. Backend
Python 3.10+ recommended. Install FFmpeg if your platform needs it.

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
# Windows PowerShell: Copy-Item .env.example .env
# macOS/Linux: cp .env.example .env
uvicorn main:app --reload --port 8000
```

The default `.env` uses SQLite so the API starts without installing MySQL. The first transcription downloads the selected Whisper model. `base` is a reasonable CPU demo model; `small` may improve quality but needs more compute.

### 2. Frontend
Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Allow microphone permission. For browser microphone access, use localhost or HTTPS.

## Run backend + MySQL with Docker

From the project root:

```bash
docker compose up --build
```

This starts MySQL on host port 3307 and the API on port 8000. The Vite frontend is run separately using the frontend steps above. Docker will download model weights on the first transcription; allow time and sufficient disk/RAM.

## API
- `GET /api/health`
- `GET /api/transcriptions`
- `POST /api/transcriptions`
- `GET /api/transcriptions/{id}`
- `PUT /api/transcriptions/{id}`
- `DELETE /api/transcriptions/{id}`
- `WS /ws/transcribe` — binary Float32 mono audio at 16 kHz; send `{"action":"stop"}` to finish

Open http://localhost:8000/docs for interactive API documentation.

## Important implementation note
Whisper is not a native streaming ASR model. This demo sends 4-second audio windows and returns incremental completed chunks, so it is near-real-time rather than token-by-token live. For production, add VAD-based endpointing, overlap-aware de-duplication, a transcription queue, authentication, rate limiting, and persistent finalized sessions.

## GitHub submission
Create a new GitHub repository, then from this folder:

```bash
git init
git add .
git commit -m "Build VoxNote real-time speech transcription MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/procucev-speech-to-text.git
git push -u origin main
```

## Deployment checklist
- Deploy API to a Docker-compatible host with enough RAM and persistent model cache.
- Use managed MySQL and set `DATABASE_URL`.
- Deploy frontend static build and set `VITE_API_URL` to the public API URL.
- Set `FRONTEND_ORIGIN` to the deployed frontend origin.
- Use HTTPS so browser microphone access and secure WebSockets work.
- Do not expose the example database passwords; set secrets in your cloud dashboard.

## License
This project is an assignment starter. Faster-Whisper and its model weights have their own licensing and model terms; review them before commercial use.
