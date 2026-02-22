import logging
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db, Attempt, Transcription, Feedback, Analytics
from models import TranscriptionOut, FeedbackOut, AnalyticsOut
from services.transcription import transcribe_audio
from services.speech_analytics import analyze_speech
from services.coach import get_coaching_feedback
from services.llm_analytics import analyze_speech_with_llm

logger = logging.getLogger(__name__)

router = APIRouter()


def run_analysis(attempt_id: int):
    from database import SessionLocal

    db = SessionLocal()
    try:
        attempt = db.get(Attempt, attempt_id)
        if not attempt:
            return

        # Transcribe (must complete before parallel tasks)
        transcript_text, word_timestamps = transcribe_audio(attempt.video_path)
        transcription = Transcription(
            attempt_id=attempt_id,
            transcript_text=transcript_text,
            word_timestamps=word_timestamps,
        )
        db.add(transcription)
        db.commit()

        question_text = attempt.question.question_text
        duration = attempt.duration_seconds

        # Run heuristic analytics, LLM analytics, and coaching in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:
            heuristic_future = executor.submit(
                analyze_speech, transcript_text, word_timestamps, duration
            )
            llm_future = executor.submit(analyze_speech_with_llm, transcript_text)
            coaching_future = executor.submit(
                get_coaching_feedback, question_text, transcript_text
            )

            # Collect heuristic results
            try:
                analytics_data = heuristic_future.result()
            except Exception:
                logger.exception("Heuristic analytics failed for attempt %d", attempt_id)
                analytics_data = {}

            # Collect LLM results
            try:
                llm_data = llm_future.result()
            except Exception:
                logger.exception("LLM analytics failed for attempt %d", attempt_id)
                llm_data = None

            # Merge heuristic + LLM data
            if llm_data:
                analytics_data.update(llm_data)

            analytics = Analytics(attempt_id=attempt_id, **analytics_data)
            db.add(analytics)
            db.commit()

            # Collect coaching results
            try:
                feedback_text, star_scores = coaching_future.result()
            except Exception:
                logger.exception("Coaching feedback failed for attempt %d", attempt_id)
                feedback_text = "Coaching feedback generation failed. Please try again by re-recording."
                star_scores = None

            feedback = Feedback(
                attempt_id=attempt_id,
                coach_feedback=feedback_text,
                star_scores=star_scores,
            )
            db.add(feedback)
            db.commit()
    except Exception:
        logger.exception("Analysis failed for attempt %d", attempt_id)
        db.rollback()
        # Store error as feedback so the frontend knows analysis failed
        try:
            existing_feedback = db.query(Feedback).filter_by(attempt_id=attempt_id).first()
            if not existing_feedback:
                error_feedback = Feedback(
                    attempt_id=attempt_id,
                    coach_feedback="Analysis failed. Please try again by re-recording.",
                    star_scores=None,
                )
                db.add(error_feedback)
                db.commit()
        except Exception:
            logger.exception("Failed to store error feedback for attempt %d", attempt_id)
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
