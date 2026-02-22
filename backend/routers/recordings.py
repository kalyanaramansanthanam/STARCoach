import os
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from database import get_db, Attempt

router = APIRouter()

RECORDINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "recordings")


@router.post("/recordings")
async def upload_recording(
    question_id: int = Form(...),
    timer_setting: int = Form(120),
    duration_seconds: float = Form(0),
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    os.makedirs(RECORDINGS_DIR, exist_ok=True)

    existing_count = (
        db.query(Attempt).filter(Attempt.question_id == question_id).count()
    )
    attempt_number = existing_count + 1

    filename = f"{question_id}_{attempt_number}_{uuid.uuid4().hex[:8]}.webm"
    filepath = os.path.join(RECORDINGS_DIR, filename)

    contents = await video.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    attempt = Attempt(
        question_id=question_id,
        attempt_number=attempt_number,
        video_path=filename,
        duration_seconds=duration_seconds,
        timer_setting=timer_setting,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {"attempt_id": attempt.id, "attempt_number": attempt_number}


@router.get("/recordings")
def list_recordings(db: Session = Depends(get_db)):
    attempts = db.query(Attempt).order_by(Attempt.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "question_id": a.question_id,
            "attempt_number": a.attempt_number,
            "video_path": a.video_path,
            "duration_seconds": a.duration_seconds,
            "created_at": a.created_at,
        }
        for a in attempts
    ]
