from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from database import Attempt, Question
from models import ProgressOut, ProgressPoint


def compute_progress(question_id: int, db: Session) -> ProgressOut:
    """Compute progress data across attempts for a question."""
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    attempts = (
        db.query(Attempt)
        .options(joinedload(Attempt.analytics), joinedload(Attempt.feedback))
        .filter(Attempt.question_id == question_id)
        .order_by(Attempt.attempt_number.asc())
        .all()
    )

    data_points = []
    for a in attempts:
        point = ProgressPoint(
            attempt_number=a.attempt_number,
            clarity_score=a.analytics.clarity_score if a.analytics else None,
            confidence_score=a.analytics.confidence_score if a.analytics else None,
            structure_score=a.analytics.structure_score if a.analytics else None,
            star_scores=a.feedback.star_scores if a.feedback else None,
            created_at=a.created_at,
        )
        data_points.append(point)

    # Determine trend from scored attempts
    scored = [p for p in data_points if p.clarity_score is not None]
    trend = "steady"
    if len(scored) >= 2:
        first_avg = _avg_scores(scored[0])
        last_avg = _avg_scores(scored[-1])
        if last_avg > first_avg + 0.3:
            trend = "improving"
        elif last_avg < first_avg - 0.3:
            trend = "declining"

    return ProgressOut(
        question_id=question_id,
        question_text=question.question_text,
        trend=trend,
        data_points=data_points,
    )


def _avg_scores(point: ProgressPoint) -> float:
    scores = [s for s in [point.clarity_score, point.confidence_score, point.structure_score] if s is not None]
    return sum(scores) / len(scores) if scores else 0
