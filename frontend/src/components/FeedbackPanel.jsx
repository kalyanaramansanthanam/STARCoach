function StarScores({ scoresJson }) {
  if (!scoresJson) return null

  let scores
  try {
    scores = JSON.parse(scoresJson)
  } catch {
    return null
  }

  const labels = { situation: 'Situation', task: 'Task', action: 'Action', result: 'Result' }

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {Object.entries(labels).map(([key, label]) => {
        const score = scores[key] || 0
        const color = score >= 4 ? 'text-green-400' : score === 3 ? 'text-yellow-400' : 'text-red-400'
        return (
          <div key={key} className="bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xl font-bold ${color}`}>{score}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${i <= score ? (score >= 4 ? 'bg-green-400' : score === 3 ? 'bg-yellow-400' : 'bg-red-400') : 'bg-gray-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function FeedbackPanel({ feedback }) {
  if (!feedback) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Coach Feedback</h3>
        <p className="text-gray-400 text-sm">No feedback available yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-3">Coach Feedback</h3>
      <StarScores scoresJson={feedback.star_scores} />
      <div className="mt-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
        {feedback.coach_feedback}
      </div>
    </div>
  )
}
