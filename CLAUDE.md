# CLAUDE.md

## Workflow
- Commit and push issues as PRs (one PR per issue)
- Run the code and do linting and type checks
- Use `ty` for fast Python type checking
- QA the code and feature, include evidence in the PR if possible
- Run `/review` skill on the PR and address feedback before merging

## Tools
- Use `uv` for Python dependency management (`uv add`, `uv sync`, `uv run`) — not pip
- Use `ty` for Python type checking
- Backend: `cd backend && uv run uvicorn main:app --reload`
- Frontend: `cd frontend && npm run dev`
- Docker: `docker compose up` for full stack

## Project Structure
- `backend/` — FastAPI + SQLAlchemy + SQLite
- `frontend/` — Vite + React + Tailwind CSS
- `data/` — SQLite database + video recordings (complete app state)
- AI Feedback: Gemini 3 Flash via Google GenAI SDK
- Transcription: OpenAI Whisper (local)
