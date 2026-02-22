from pydantic import BaseModel, ConfigDict


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    question_text: str
    tips: str | None = None
    attempt_count: int = 0


class AttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    attempt_number: int
    video_path: str
    duration_seconds: float | None = None
    timer_setting: int | None = None
    created_at: str | None = None


class TranscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    attempt_id: int
    transcript_text: str
    word_timestamps: str | None = None


class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    attempt_id: int
    coach_feedback: str
    star_scores: str | None = None


class AnalyticsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    attempt_id: int
    pause_count: int | None = None
    filler_word_count: int | None = None
    filler_words_detail: str | None = None
    answer_duration_seconds: float | None = None
    words_per_minute: float | None = None
    clarity_score: int | None = None
    confidence_score: int | None = None
    structure_score: int | None = None


class AttemptDetailOut(BaseModel):
    attempt: AttemptOut
    transcription: TranscriptionOut | None = None
    feedback: FeedbackOut | None = None
    analytics: AnalyticsOut | None = None


class ProgressPoint(BaseModel):
    attempt_number: int
    clarity_score: int | None = None
    confidence_score: int | None = None
    structure_score: int | None = None
    star_scores: str | None = None
    created_at: str | None = None


class ProgressOut(BaseModel):
    question_id: int
    question_text: str
    trend: str  # "improving", "steady", "declining"
    data_points: list[ProgressPoint]
