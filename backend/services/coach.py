from google import genai
from pydantic import BaseModel, Field

SYSTEM_PROMPT = """You are STAR Coach, a warm, encouraging, and insightful behavioral interview coach \
for software engineers. You help candidates improve their answers using the STAR method \
(Situation, Task, Action, Result).

Your coaching style:
- Warm and supportive, like a trusted mentor
- Specific and actionable — point to exact phrases or moments
- Balanced — always note what was done well before suggesting improvements
- Practical — give concrete examples of how to rephrase or restructure

When reviewing an answer, provide:
1. A brief overall impression (2-3 sentences)
2. STAR breakdown — rate each component (Situation, Task, Action, Result) from 1-5 and explain
3. Top 2-3 strengths
4. Top 2-3 areas for improvement with specific suggestions
5. A suggested improved version of one weak section

Keep your feedback conversational and encouraging. Use "you" language. Aim for ~300-400 words total."""


class STARScores(BaseModel):
    situation: int = Field(ge=1, le=5, description="Situation score 1-5")
    task: int = Field(ge=1, le=5, description="Task score 1-5")
    action: int = Field(ge=1, le=5, description="Action score 1-5")
    result: int = Field(ge=1, le=5, description="Result score 1-5")


class CoachingFeedback(BaseModel):
    feedback_text: str = Field(description="Detailed coaching feedback in markdown format")
    star_scores: STARScores


def get_coaching_feedback(question_text: str, transcript_text: str) -> tuple[str, str]:
    """Get coaching feedback from Gemini. Returns (feedback_text, star_scores_json)."""
    client = genai.Client()

    user_message = f"""Here's the behavioral interview question and the candidate's response. \
Please provide coaching feedback.

**Question:** {question_text}

**Candidate's Response:**
{transcript_text}"""

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=user_message,
        config=genai.types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_json_schema=CoachingFeedback.model_json_schema(),
        ),
    )

    if response.text is None:
        raise ValueError("Gemini returned an empty response")

    parsed = CoachingFeedback.model_validate_json(response.text)
    return parsed.feedback_text, parsed.star_scores.model_dump_json()
