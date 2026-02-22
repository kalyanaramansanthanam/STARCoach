from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db, Attempt, Transcription, Feedback, Analytics
from models import AttemptDetailOut, AttemptOut, TranscriptionOut, FeedbackOut, AnalyticsOut
from services.transcription import transcribe_audio
from services.speech_analytics import analyze_speech
from services.coach import get_coaching_feedback

router = APIRouter()


def run_analysis(attempt_id: int):
    from database import SessionLocal

    db = SessionLocal()
    try:
        attempt = db.get(Attempt, attempt_id)
        if not attempt:
            return

        # Step 1: Transcribe
        transcript_text, word_timestamps = transcribe_audio(attempt.video_path)
        transcription = Transcription(
            attempt_id=attempt_id,
            transcript_text=transcript_text,
            word_timestamps=word_timestamps,
        )
        db.add(transcription)
        db.commit()

        # Step 2: Speech analytics
        analytics_data = analyze_speech(
            transcript_text, word_timestamps, attempt.duration_seconds
        )
        analytics = Analytics(attempt_id=attempt_id, **analytics_data)
        db.add(analytics)
        db.commit()

        # Step 3: Claude coaching feedback
        question = attempt.question
        feedback_text, star_scores = get_coaching_feedback(
            question.question_text, transcript_text
        )
        feedback = Feedback(
            attempt_id=attempt_id,
            coach_feedback=feedback_text,
            star_scores=star_scores,
        )
        db.add(feedback)
        db.commit()
    except Exception as e:
        print(f"Analysis error for attempt {attempt_id}: {e}")
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
    feedback = db.query(Feedback).filter_by(attempt_id=attempt_id).first()

    if feedback:
        status = "complete"
    elif analytics:
        status = "feedback_pending"
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
    if feedback:
        result["feedback"] = FeedbackOut.model_validate(feedback)

    return result
