# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2026-02-23

### Added
- Initial release of STARCoach
- 8 curated SWE behavioral interview questions across categories (Conflict, Learning, Failure, Leadership, Technical, Trade-offs, Growth, Impact)
- Video recording interface with webcam preview and configurable timer (1-5 minutes)
- Zoom-style split-screen layout during recording (coach avatar + user video)
- Local Whisper-based transcription (no external API calls)
- AI coaching feedback using STAR method via Gemini 2.5 Flash
- Speech analytics with dual scoring system:
  - Rule-based metrics: filler words, pause count, words per minute, duration
  - LLM-based scoring: clarity, confidence, structure (1-5 scale with justifications)
- Progress tracking across multiple attempts per question
- Trend analysis (improving, steady, declining)
- Dashboard landing page with:
  - Motivational quote
  - Practice statistics (sessions, questions practiced, total time, average score)
  - Score breakdowns (clarity, confidence, structure)
  - GitHub-style activity calendar showing practice streak
- Docker Compose setup for single-command deployment
- Local-first architecture with all data stored in `./data/` directory
- SQLite database for persistent storage
- Health checks for backend and frontend services

### Technical Details
- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: Vite + React + Tailwind CSS + Chart.js
- Transcription: OpenAI Whisper (local)
- AI Feedback: Google Gemini API
- Deployment: Docker Compose
