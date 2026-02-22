import json
import re

FILLER_WORDS = {"um", "uh", "like", "you know", "so", "actually", "basically", "right", "well", "I mean"}


def analyze_speech(
    transcript_text: str,
    word_timestamps_json: str,
    duration_seconds: float | None,
) -> dict:
    """Analyze speech patterns from transcript. Returns dict matching Analytics columns."""
    words_list = transcript_text.split()
    total_words = len(words_list)

    # Parse word timestamps for pause detection
    timestamps = []
    try:
        timestamps = json.loads(word_timestamps_json) if word_timestamps_json else []
    except json.JSONDecodeError:
        pass

    # Pause detection (gaps > 1.5 seconds between words)
    pause_count = 0
    for i in range(1, len(timestamps)):
        gap = timestamps[i]["start"] - timestamps[i - 1]["end"]
        if gap > 1.5:
            pause_count += 1

    # Filler word detection
    text_lower = transcript_text.lower()
    filler_detail = {}
    filler_total = 0

    for filler in FILLER_WORDS:
        count = len(re.findall(r'\b' + re.escape(filler) + r'\b', text_lower))
        if count > 0:
            filler_detail[filler] = count
            filler_total += count

    # Duration and WPM
    if duration_seconds and duration_seconds > 0:
        answer_duration = duration_seconds
    elif timestamps:
        answer_duration = timestamps[-1]["end"] - timestamps[0]["start"]
    else:
        answer_duration = 0

    wpm = (total_words / (answer_duration / 60)) if answer_duration > 0 else 0

    # Scoring (1-5 scale)
    # Clarity: based on filler word ratio
    filler_ratio = filler_total / max(total_words, 1)
    if filler_ratio < 0.02:
        clarity_score = 5
    elif filler_ratio < 0.05:
        clarity_score = 4
    elif filler_ratio < 0.08:
        clarity_score = 3
    elif filler_ratio < 0.12:
        clarity_score = 2
    else:
        clarity_score = 1

    # Confidence: based on pause frequency and pacing
    pause_rate = pause_count / max(answer_duration / 60, 0.1)
    if pause_rate < 2:
        confidence_score = 5
    elif pause_rate < 4:
        confidence_score = 4
    elif pause_rate < 6:
        confidence_score = 3
    elif pause_rate < 8:
        confidence_score = 2
    else:
        confidence_score = 1

    # Structure: based on answer length (too short or too long penalized)
    if 100 <= total_words <= 400:
        structure_score = 5
    elif 60 <= total_words < 100 or 400 < total_words <= 500:
        structure_score = 4
    elif 30 <= total_words < 60 or 500 < total_words <= 600:
        structure_score = 3
    elif 15 <= total_words < 30 or 600 < total_words <= 800:
        structure_score = 2
    else:
        structure_score = 1

    return {
        "pause_count": pause_count,
        "filler_word_count": filler_total,
        "filler_words_detail": json.dumps(filler_detail),
        "answer_duration_seconds": round(answer_duration, 1),
        "words_per_minute": round(wpm, 1),
        "clarity_score": clarity_score,
        "confidence_score": confidence_score,
        "structure_score": structure_score,
    }
