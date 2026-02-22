import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from database import get_db, Attempt

router = APIRouter()

RECORDINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "recordings")
MAX_UPLOAD_BYTES = 500 * 1024 * 1024  # 500 MB


@router.post("/recordings")
async def upload_recording(
    question_id: int = Form(...),
    timer_setting: int = Form(120),
    duration_seconds: float = Form(0),
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    os.makedirs(RECORDINGS_DIR, exist_ok=True)

    # Stream upload to disk with size limit
    filename = f"{question_id}_{uuid.uuid4().hex[:8]}.webm"
    filepath = os.path.join(RECORDINGS_DIR, filename)
    total_size = 0

    try:
        with open(filepath, "wb") as f:
            while chunk := await video.read(1024 * 1024):
                total_size += len(chunk)
                if total_size > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="File too large")
                f.write(chunk)
    except HTTPException:
        os.unlink(filepath)
        raise

    # Use COALESCE + MAX to avoid race condition on attempt_number
    max_num = (
        db.query(sa_func.coalesce(sa_func.max(Attempt.attempt_number), 0))
        .filter(Attempt.question_id == question_id)
        .scalar()
    )
    attempt_number = max_num + 1

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
