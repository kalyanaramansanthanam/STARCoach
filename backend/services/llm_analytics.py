import json
import logging

from google import genai

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
5 = Excellent STAR framework adherence with clear, distinct components

Output your analysis, then on the very last line output scores as JSON in this exact format:
ANALYTICS_JSON: {"clarity_score": X, "clarity_justification": "...", "confidence_score": X, "confidence_justification": "...", "structure_score": X, "structure_justification": "..."}
where X is 1-5 and justifications are 1-2 sentences each."""


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
                max_output_tokens=1024,
            ),
        )

        full_response = response.text
        lines = full_response.strip().split("\n")

        for line in reversed(lines):
            if "ANALYTICS_JSON:" in line:
                json_str = line.split("ANALYTICS_JSON:")[1].strip()
                parsed = json.loads(json_str)
                return {
                    "clarity_llm_score": parsed["clarity_score"],
                    "clarity_llm_justification": parsed["clarity_justification"],
                    "confidence_llm_score": parsed["confidence_score"],
                    "confidence_llm_justification": parsed["confidence_justification"],
                    "structure_llm_score": parsed["structure_score"],
                    "structure_llm_justification": parsed["structure_justification"],
                }

        logger.warning("LLM analytics: ANALYTICS_JSON marker not found in response")
        return None
    except Exception:
        logger.exception("LLM speech analytics failed")
        return None
