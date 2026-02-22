import { useState } from 'react'

const METRIC_DESCRIPTIONS = {
  Clarity: 'Measures articulation, vocabulary, and use of filler words',
  Confidence: 'Evaluates tone, pacing, and hesitation patterns',
  Structure: 'Assesses organization, logical flow, and STAR framework adherence',
}

function InfoTooltip({ description }) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-block ml-1 cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="text-gray-500 text-xs">&#x2139;&#xFE0F;</span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-gray-300 text-xs rounded-lg p-2 shadow-lg border border-gray-600 z-10">
          {description}
        </span>
      )}
    </span>
  )
}

function JustificationTooltip({ text }) {
  const [show, setShow] = useState(false)

  if (!text) return null

  return (
    <span
      className="relative inline-block ml-1 cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="text-gray-500 text-xs">&#x1F4AC;</span>
      {show && (
        <span className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-gray-300 text-xs rounded-lg p-2 shadow-lg border border-gray-600 z-10">
          {text}
        </span>
      )}
    </span>
  )
}

function ScoreDots({ score }) {
  if (score == null) return <span className="text-gray-500 text-sm">--</span>

  const color = score >= 4 ? 'bg-green-400' : score === 3 ? 'bg-yellow-400' : 'bg-red-400'
  const textColor = score >= 4 ? 'text-green-400' : score === 3 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= score ? color : 'bg-gray-600'}`}
          />
        ))}
      </div>
      <span className={`text-sm font-semibold ${textColor} w-4 text-right`}>{score}</span>
    </div>
  )
}

function MetricRowWithLLM({ label, heuristicScore, llmScore, llmJustification }) {
  if (heuristicScore == null && llmScore == null) return null

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-200 text-sm font-medium">
          {label}
          <InfoTooltip description={METRIC_DESCRIPTIONS[label]} />
        </span>
      </div>
      <div className="space-y-1 pl-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">Rule-based</span>
          <ScoreDots score={heuristicScore} />
        </div>
        {llmScore != null && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">AI-based</span>
            <div className="flex items-center">
              <ScoreDots score={llmScore} />
              <JustificationTooltip text={llmJustification} />
            </div>
          </div>
        )}
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
        <MetricRowWithLLM
          label="Clarity"
          heuristicScore={analytics.clarity_score}
          llmScore={analytics.clarity_llm_score}
          llmJustification={analytics.clarity_llm_justification}
        />
        <MetricRowWithLLM
          label="Confidence"
          heuristicScore={analytics.confidence_score}
          llmScore={analytics.confidence_llm_score}
          llmJustification={analytics.confidence_llm_justification}
        />
        <MetricRowWithLLM
          label="Structure"
          heuristicScore={analytics.structure_score}
          llmScore={analytics.structure_llm_score}
          llmJustification={analytics.structure_llm_justification}
        />
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
