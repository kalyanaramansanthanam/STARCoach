function MetricRow({ label, score }) {
  if (score == null) return null

  const color = score >= 4 ? 'bg-green-400' : score === 3 ? 'bg-yellow-400' : 'bg-red-400'
  const textColor = score >= 4 ? 'text-green-400' : score === 3 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-300 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full ${i <= score ? color : 'bg-gray-600'}`}
            />
          ))}
        </div>
        <span className={`text-sm font-semibold ${textColor} w-4 text-right`}>{score}</span>
      </div>
    </div>
  )
}

export default function AnalyticsCard({ analytics }) {
  if (!analytics) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Speech Analytics</h3>
        <p className="text-gray-400 text-sm">No analytics available yet.</p>
      </div>
    )
  }

  let fillerDetail = {}
  try {
    fillerDetail = JSON.parse(analytics.filler_words_detail || '{}')
  } catch {}

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-3">Speech Analytics</h3>

      <div className="divide-y divide-gray-700">
        <MetricRow label="Clarity" score={analytics.clarity_score} />
        <MetricRow label="Confidence" score={analytics.confidence_score} />
        <MetricRow label="Structure" score={analytics.structure_score} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-400 text-xs uppercase">WPM</p>
          <p className="text-white font-semibold">{analytics.words_per_minute}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-400 text-xs uppercase">Duration</p>
          <p className="text-white font-semibold">{Math.round(analytics.answer_duration_seconds)}s</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-400 text-xs uppercase">Pauses</p>
          <p className="text-white font-semibold">{analytics.pause_count}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-400 text-xs uppercase">Filler Words</p>
          <p className="text-white font-semibold">{analytics.filler_word_count}</p>
        </div>
      </div>

      {Object.keys(fillerDetail).length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-1">Filler word breakdown:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(fillerDetail).map(([word, count]) => (
              <span key={word} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                "{word}" x{count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
