import logging

from google import genai
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are a speech analytics expert. Evaluate the following interview response transcript \
and provide scores (1-5) with brief justifications for each metric.

Scoring rubrics:

**Clarity (1-5):**
1 = Incoherent, very frequent filler words, hard to follow
2 = Unclear phrasing, many filler words, disjointed ideas
3 = Mostly clear but some vague language or filler words
4 = Clear articulation, good vocabulary, minimal filler words
5 = Exceptionally clear, precise vocabulary, logical flow, no filler words

**Confidence (1-5):**
1 = Pervasive hedging, very tentative, many qualifiers
2 = Frequent hedging ("I think maybe", "sort of"), indirect
3 = Some hedging but generally direct communication
4 = Mostly definitive statements, minimal hedging, good directness
5 = Highly confident, decisive language, authoritative tone

**Structure (1-5):**
1 = No discernible organization, rambling
2 = Weak structure, missing most STAR components
3 = Some structure, but STAR components incomplete or unclear
4 = Good structure with most STAR components (Situation, Task, Action, Result) present
5 = Excellent STAR framework adherence with clear, distinct components"""


class AnalyticsResult(BaseModel):
    clarity_score: int = Field(ge=1, le=5, description="Clarity score 1-5")
    clarity_justification: str = Field(description="1-2 sentence justification for clarity score")
    confidence_score: int = Field(ge=1, le=5, description="Confidence score 1-5")
    confidence_justification: str = Field(description="1-2 sentence justification for confidence score")
    structure_score: int = Field(ge=1, le=5, description="Structure score 1-5")
    structure_justification: str = Field(description="1-2 sentence justification for structure score")


def analyze_speech_with_llm(transcript_text: str) -> dict | None:
    """Analyze speech using Gemini LLM. Returns dict with scores and justifications, or None on failure."""
    try:
        client = genai.Client()

        user_message = f"""Please analyze this interview response transcript:

{transcript_text}"""

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=user_message,
            config=genai.types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_json_schema=AnalyticsResult.model_json_schema(),
            ),
        )

        if response.text is None:
            raise ValueError("Gemini returned an empty response")

        parsed = AnalyticsResult.model_validate_json(response.text)
        return {
            "clarity_llm_score": parsed.clarity_score,
            "clarity_llm_justification": parsed.clarity_justification,
            "confidence_llm_score": parsed.confidence_score,
            "confidence_llm_justification": parsed.confidence_justification,
            "structure_llm_score": parsed.structure_score,
            "structure_llm_justification": parsed.structure_justification,
        }
    except Exception:
        logger.exception("LLM speech analytics failed")
        return None
