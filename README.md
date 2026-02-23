# STARCoach

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/kalyanaramansanthanam/STARCoach/releases/tag/v0.1.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Local-first behavioral interview prep tool for practicing STAR method answers to interview questions. Record yourself, get AI coaching feedback, and track your progress over time.

Everything runs on your machine. Your video recordings, transcripts, feedback, and scores never leave your computer — the only external call is to the Gemini API for coaching feedback. All your data lives in a single `./data/` folder (SQLite database + video recordings), making it easy to back up, move, or delete.

Inspired by the UltraSpeaking Course and the struggle to do behavioral interviews well.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: Vite + React + Tailwind CSS
- **Transcription**: OpenAI Whisper (runs locally, no API call)
- **AI Feedback**: Gemini 3 Flash (only external dependency)
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

### Practice & Recording
- 8 curated SWE behavioral interview questions across 8 categories
- Zoom-like recording UI with webcam preview and coach avatar
- Configurable timer (1, 2, 3, or 5 minutes)
- WebM video recording with browser MediaRecorder API

### AI Analysis & Feedback
- **Transcription**: Local Whisper model (no external API calls)
- **Coaching Feedback**: Gemini AI provides detailed STAR method analysis
- **Speech Analytics**:
  - Rule-based: filler words (um, uh, etc.), pause detection, words per minute
  - LLM-based scoring (1-5): clarity, confidence, structure with detailed justifications

### Progress Tracking
- Review all past attempts for each question
- Progress chart showing improvement trends over time
- Trend analysis: improving, steady, or declining

### Dashboard
- Practice statistics: total sessions, questions practiced, practice time
- Average score breakdown across clarity, confidence, structure
- GitHub-style activity calendar showing your practice streak
- Motivational quotes to keep you going

### Privacy & Data Ownership
- **Local-first**: Everything runs on your machine
- All video recordings stored locally in `./data/recordings/`
- SQLite database with all transcripts, scores, and feedback
- Only external API call is Gemini for coaching (no videos sent)
- Easy to back up, move, or delete your data
