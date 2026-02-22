# STARCoach

Local-first behavioral interview prep tool for practicing STAR method answers to interview questions. Record yourself, get AI coaching feedback, and track your progress over time.

Everything runs on your machine. Your video recordings, transcripts, feedback, and scores never leave your computer — the only external call is to the Gemini API for coaching feedback. All your data lives in a single `./data/` folder (SQLite database + video recordings), making it easy to back up, move, or delete.

Inspired by the UltraSpeaking Course and the struggle to do behavioral interviews well.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: Vite + React + Tailwind CSS
- **Transcription**: OpenAI Whisper (runs locally, no API call)
- **AI Feedback**: Gemini 2.0 Flash (only external dependency)
- **Charts**: Chart.js / react-chartjs-2

## Quick Start (Docker)

```bash
cp .env.example .env         # add your GOOGLE_API_KEY
docker compose up             # builds & starts everything
```

Open **http://localhost:3000** — that's it.

### Your Data

All state lives in a single folder — `./data/` by default:

```
data/
├── starcoach.db        # SQLite database (questions, scores, feedback, transcripts)
└── recordings/         # Your video recordings (.webm files)
```

This is the complete state of the project. Back it up, move it to another machine, or delete it to start fresh. To customize the location or port, edit `.env`:

```bash
STARCOACH_DATA_DIR=/path/to/my/data   # default: ./data
STARCOACH_PORT=8080                    # default: 3000
```

## Local Development

### Backend

```bash
cd backend
export GOOGLE_API_KEY=your-key-here
uv sync
uv run uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api` requests to the backend at `localhost:8000`.

## Features

- Practice with curated SWE behavioral interview questions
- Zoom-like recording UI with webcam + timer
- Local Whisper transcription
- AI coaching feedback using STAR method
- Speech analytics (filler words, pacing, pauses)
- Progress tracking across attempts
