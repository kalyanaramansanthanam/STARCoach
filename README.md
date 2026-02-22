# STARCoach

Local-first behavioral interview prep tool which allows you to work on answers (using STAR method and more) for interview questions. Inspired by my experience doing the UltraSpeaking Course and struggles to do behavioral interviews well.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: Vite + React + Tailwind CSS
- **Transcription**: OpenAI Whisper (local)
- **AI Feedback**: Gemini 2.0 Flash via Google GenAI SDK
- **Charts**: Chart.js / react-chartjs-2

## Quick Start (Docker)

```bash
cp .env.example .env         # add your GOOGLE_API_KEY
docker compose up             # builds & starts everything
```

Open **http://localhost:3000** — that's it.

Your database and recordings are stored in `./data/` by default. To change the location or port, edit `.env`:

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
