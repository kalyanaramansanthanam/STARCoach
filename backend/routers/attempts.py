from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db, Attempt, Question
from models import AttemptDetailOut, AttemptOut, TranscriptionOut, FeedbackOut, AnalyticsOut

router = APIRouter()


@router.get("/attempts/{question_id}")
def list_attempts(question_id: int, db: Session = Depends(get_db)):
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    attempts = (
        db.query(Attempt)
        .filter(Attempt.question_id == question_id)
        .order_by(Attempt.attempt_number.desc())
        .all()
    )

    results = []
    for a in attempts:
        detail = AttemptDetailOut(
            attempt=AttemptOut.model_validate(a),
            transcription=(
                TranscriptionOut.model_validate(a.transcription) if a.transcription else None
            ),
            feedback=(
                FeedbackOut.model_validate(a.feedback) if a.feedback else None
            ),
            analytics=(
                AnalyticsOut.model_validate(a.analytics) if a.analytics else None
            ),
        )
        results.append(detail)

    return results
