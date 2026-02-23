from fastapi import APIRouter, Depends
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from database import get_db, Attempt, Analytics, Feedback, Question

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_attempts = db.query(sa_func.count(Attempt.id)).scalar() or 0
    questions_practiced = (
        db.query(sa_func.count(sa_func.distinct(Attempt.question_id))).scalar() or 0
    )
    total_questions = db.query(sa_func.count(Question.id)).scalar() or 0
    total_practice_time = (
        db.query(sa_func.coalesce(sa_func.sum(Attempt.duration_seconds), 0)).scalar()
    )

    # Average scores across all analytics
    avg_scores = db.query(
        sa_func.avg(Analytics.clarity_score),
        sa_func.avg(Analytics.confidence_score),
        sa_func.avg(Analytics.structure_score),
    ).first()
    avg_clarity = round(avg_scores[0], 1) if avg_scores[0] is not None else None
    avg_confidence = round(avg_scores[1], 1) if avg_scores[1] is not None else None
    avg_structure = round(avg_scores[2], 1) if avg_scores[2] is not None else None

    # Daily activity: count of attempts per date for streak calendar
    # created_at is stored as text from func.now(), format: YYYY-MM-DD HH:MM:SS
    daily_activity = (
        db.query(
            sa_func.date(Attempt.created_at).label("date"),
            sa_func.count(Attempt.id).label("count"),
        )
        .group_by(sa_func.date(Attempt.created_at))
        .order_by(sa_func.date(Attempt.created_at))
        .all()
    )
    activity = {str(row.date): row.count for row in daily_activity if row.date}

    return {
        "total_attempts": total_attempts,
        "questions_practiced": questions_practiced,
        "total_questions": total_questions,
        "total_practice_time": total_practice_time,
        "avg_clarity": avg_clarity,
        "avg_confidence": avg_confidence,
        "avg_structure": avg_structure,
        "activity": activity,
    }
