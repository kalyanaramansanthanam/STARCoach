import json
import os

RECORDINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "recordings")

_model = None


def _get_model():
    global _model
    if _model is None:
        import whisper
        _model = whisper.load_model("base")
    return _model


def transcribe_audio(video_filename: str) -> tuple[str, str]:
    """Transcribe a video file using Whisper. Returns (transcript_text, word_timestamps_json)."""
    filepath = os.path.join(RECORDINGS_DIR, video_filename)

    model = _get_model()
    result = model.transcribe(filepath, word_timestamps=True)

    transcript_text = result.get("text", "").strip()

    words = []
    for segment in result.get("segments", []):
        for word_info in segment.get("words", []):
            words.append({
                "word": word_info["word"].strip(),
                "start": round(word_info["start"], 2),
                "end": round(word_info["end"], 2),
            })

    return transcript_text, json.dumps(words)
