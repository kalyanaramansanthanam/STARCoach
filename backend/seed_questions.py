from database import SessionLocal, Question

SEED_QUESTIONS = [
    {
        "category": "Conflict",
        "question_text": "Tell me about a time you had a disagreement with a teammate about a technical decision. How did you handle it?",
        "tips": "Focus on the specific technical disagreement, how you listened to the other perspective, and how you reached a resolution. Highlight collaboration over winning.",
    },
    {
        "category": "Learning",
        "question_text": "Describe a project where you had to learn a new technology quickly. How did you approach it?",
        "tips": "Describe your learning strategy, resources you used, and how you applied the new knowledge. Show intellectual curiosity and self-direction.",
    },
    {
        "category": "Failure",
        "question_text": "Tell me about a time you missed a deadline or a project didn't go as planned. What happened?",
        "tips": "Be honest about what went wrong. Focus on what you learned and how you prevented similar issues in the future. Show accountability.",
    },
    {
        "category": "Leadership",
        "question_text": "Describe a situation where you had to lead a project or initiative. What was the outcome?",
        "tips": "Highlight how you motivated others, made decisions, and handled obstacles. Quantify the outcome if possible.",
    },
    {
        "category": "Technical",
        "question_text": "Tell me about a time you had to debug a particularly challenging production issue.",
        "tips": "Walk through your debugging process step by step. Highlight tools you used, how you narrowed down the issue, and how you communicated with stakeholders.",
    },
    {
        "category": "Trade-offs",
        "question_text": "Describe a situation where you had to make a trade-off between speed and quality.",
        "tips": "Explain the context and constraints. Show your decision-making framework and how you communicated the trade-off to stakeholders.",
    },
    {
        "category": "Growth",
        "question_text": "Tell me about a time you received critical feedback. How did you respond?",
        "tips": "Show that you can receive feedback gracefully. Describe the specific changes you made as a result. Demonstrate growth mindset.",
    },
    {
        "category": "Impact",
        "question_text": "Describe a project you're most proud of. What was your specific contribution?",
        "tips": "Be specific about YOUR contribution vs. the team's. Quantify impact where possible. Show passion and ownership.",
    },
]


def seed():
    db = SessionLocal()
    try:
        if db.query(Question).count() == 0:
            for q in SEED_QUESTIONS:
                db.add(Question(**q))
            db.commit()
            print(f"Seeded {len(SEED_QUESTIONS)} questions.")
        else:
            print("Questions already seeded.")
    finally:
        db.close()


if __name__ == "__main__":
    from database import init_db
    init_db()
    seed()
