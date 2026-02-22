# STARCoach

Local-first behavioral interview prep tool which allows you to work on answers (using STAR method and more) for interview questions. Inspired by my experience doing the UltraSpeaking Course and struggles to do behavioral interviews well.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: Vite + React + Tailwind CSS
- **Transcription**: OpenAI Whisper (local)
- **AI Feedback**: Claude Sonnet 4.5 via Anthropic API
- **Charts**: Chart.js / react-chartjs-2

## Getting Started

### Backend

```bash
cd backend
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

### Environment Variables

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY=your-key-here
```

## Features

- Practice with curated SWE behavioral interview questions
- Zoom-like recording UI with webcam + timer
- Local Whisper transcription
- AI coaching feedback using STAR method
- Speech analytics (filler words, pacing, pauses)
- Progress tracking across attempts
