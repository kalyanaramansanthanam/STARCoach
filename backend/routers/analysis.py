import logging

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db, Attempt, Transcription, Analytics
from models import TranscriptionOut, AnalyticsOut
from services.transcription import transcribe_audio
from services.speech_analytics import analyze_speech

logger = logging.getLogger(__name__)

router = APIRouter()


def run_analysis(attempt_id: int):
    from database import SessionLocal

    db = SessionLocal()
    try:
        attempt = db.get(Attempt, attempt_id)
        if not attempt:
            return

        # Transcribe
        transcript_text, word_timestamps = transcribe_audio(attempt.video_path)
        transcription = Transcription(
            attempt_id=attempt_id,
            transcript_text=transcript_text,
            word_timestamps=word_timestamps,
        )
        db.add(transcription)
        db.commit()

        # Speech analytics
        analytics_data = analyze_speech(
            transcript_text, word_timestamps, attempt.duration_seconds
        )
        analytics = Analytics(attempt_id=attempt_id, **analytics_data)
        db.add(analytics)
        db.commit()
    except Exception:
        logger.exception("Analysis failed for attempt %d", attempt_id)
        db.rollback()
    finally:
        db.close()


@router.post("/analyze/{attempt_id}")
def trigger_analysis(
    attempt_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    attempt = db.get(Attempt, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    existing = db.query(Transcription).filter_by(attempt_id=attempt_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already analyzed")

    background_tasks.add_task(run_analysis, attempt_id)
    return {"status": "processing", "attempt_id": attempt_id}


@router.get("/analyze/{attempt_id}/status")
def analysis_status(attempt_id: int, db: Session = Depends(get_db)):
    attempt = db.get(Attempt, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    transcription = db.query(Transcription).filter_by(attempt_id=attempt_id).first()
    analytics = db.query(Analytics).filter_by(attempt_id=attempt_id).first()

    if analytics:
        status = "complete"
    elif transcription:
        status = "analytics_pending"
    else:
        status = "transcribing"

    result = {
        "status": status,
        "attempt_id": attempt_id,
    }

    if transcription:
        result["transcription"] = TranscriptionOut.model_validate(transcription)
    if analytics:
        result["analytics"] = AnalyticsOut.model_validate(analytics)

    return result
