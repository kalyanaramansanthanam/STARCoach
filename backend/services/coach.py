import json

from google import genai

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


def get_coaching_feedback(question_text: str, transcript_text: str) -> tuple[str, str]:
    """Get coaching feedback from Gemini. Returns (feedback_text, star_scores_json)."""
    client = genai.Client()

    user_message = f"""Here's the behavioral interview question and the candidate's response. \
Please provide coaching feedback.

**Question:** {question_text}

**Candidate's Response:**
{transcript_text}

Please also output STAR scores as JSON on the very last line in this exact format:
STAR_SCORES: {{"situation": X, "task": X, "action": X, "result": X}}
where X is 1-5."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_message,
        config=genai.types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            max_output_tokens=1024,
        ),
    )

    full_response = response.text

    # Parse STAR scores from last line
    lines = full_response.strip().split("\n")
    star_scores = json.dumps({"situation": 3, "task": 3, "action": 3, "result": 3})
    feedback_text = full_response

    for line in reversed(lines):
        if "STAR_SCORES:" in line:
            try:
                json_str = line.split("STAR_SCORES:")[1].strip()
                scores = json.loads(json_str)
                star_scores = json.dumps(scores)
                feedback_text = "\n".join(
                    l for l in lines if "STAR_SCORES:" not in l
                ).strip()
            except (json.JSONDecodeError, IndexError):
                pass
            break

    return feedback_text, star_scores
