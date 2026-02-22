import os
from sqlalchemy import (
    create_engine, Column, Integer, Text, Float, ForeignKey, func
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "starcoach.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(Text, nullable=False)
    question_text = Column(Text, nullable=False)
    tips = Column(Text)
    attempts = relationship("Attempt", back_populates="question")


class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    video_path = Column(Text, nullable=False)
    duration_seconds = Column(Float)
    timer_setting = Column(Integer)
    created_at = Column(Text, server_default=func.now())

    question = relationship("Question", back_populates="attempts")
    transcription = relationship("Transcription", uselist=False, back_populates="attempt")
    feedback = relationship("Feedback", uselist=False, back_populates="attempt")
    analytics = relationship("Analytics", uselist=False, back_populates="attempt")


class Transcription(Base):
    __tablename__ = "transcriptions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False, unique=True)
    transcript_text = Column(Text, nullable=False)
    word_timestamps = Column(Text)
    created_at = Column(Text, server_default=func.now())

    attempt = relationship("Attempt", back_populates="transcription")


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False, unique=True)
    coach_feedback = Column(Text, nullable=False)
    star_scores = Column(Text)
    created_at = Column(Text, server_default=func.now())

    attempt = relationship("Attempt", back_populates="feedback")


class Analytics(Base):
    __tablename__ = "analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False, unique=True)
    pause_count = Column(Integer)
    filler_word_count = Column(Integer)
    filler_words_detail = Column(Text)
    answer_duration_seconds = Column(Float)
    words_per_minute = Column(Float)
    clarity_score = Column(Integer)
    confidence_score = Column(Integer)
    structure_score = Column(Integer)
    created_at = Column(Text, server_default=func.now())

    attempt = relationship("Attempt", back_populates="analytics")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
