from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db, Question
from models import QuestionOut

router = APIRouter()


@router.get("/questions", response_model=list[QuestionOut])
def list_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    result = []
    for q in questions:
        result.append(
            QuestionOut(
                id=q.id,
                category=q.category,
                question_text=q.question_text,
                tips=q.tips,
                attempt_count=len(q.attempts),
            )
        )
    return result
