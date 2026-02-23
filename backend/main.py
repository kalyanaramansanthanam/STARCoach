import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db
from seed_questions import seed
from routers import questions, recordings, analysis, attempts, dashboard

RECORDINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "recordings")
os.makedirs(RECORDINGS_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed()
    yield


app = FastAPI(title="STARCoach API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(questions.router, prefix="/api")
app.include_router(recordings.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(attempts.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

app.mount("/recordings", StaticFiles(directory=RECORDINGS_DIR), name="recordings")


@app.get("/api/health")
def health():
    return {"status": "ok"}
