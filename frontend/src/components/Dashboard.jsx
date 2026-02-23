import { useMemo } from 'react'

const QUOTE = {
  text: 'You get rewarded in public for what you practice for years in private.',
  author: 'Tony Robbins',
}

function formatTime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remainMins = mins % 60
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`
}

function StreakCalendar({ activity }) {
  const { weeks, months } = useMemo(() => {
    const today = new Date()
    const days = []

    // 20 weeks of history (140 days)
    for (let i = 139; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      days.push({ date: key, count: activity[key] || 0, day: d.getDay() })
    }

    // Group into weeks (columns), starting from Sunday
    const weeks = []
    let currentWeek = new Array(days[0].day).fill(null)
    for (const day of days) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    // Month labels
    const months = []
    let lastMonth = null
    weeks.forEach((week, i) => {
      const firstDay = week.find((d) => d !== null)
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth()
        if (month !== lastMonth) {
          months.push({ index: i, label: new Date(firstDay.date).toLocaleString('default', { month: 'short' }) })
          lastMonth = month
        }
      }
    })

    return { weeks, months }
  }, [activity])

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-800'
    if (count === 1) return 'bg-emerald-900'
    if (count === 2) return 'bg-emerald-700'
    if (count <= 4) return 'bg-emerald-500'
    return 'bg-emerald-400'
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-0.5 mb-1 ml-8 text-[10px] text-gray-500">
          {weeks.map((_, i) => {
            const month = months.find((m) => m.index === i)
            return (
              <div key={i} className="w-3" style={{ minWidth: 12 }}>
                {month ? month.label : ''}
              </div>
            )
          })}
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-0.5 text-[10px] text-gray-500 mr-1">
            <div className="h-3">Mon</div>
            <div className="h-3"></div>
            <div className="h-3">Wed</div>
            <div className="h-3"></div>
            <div className="h-3">Fri</div>
            <div className="h-3"></div>
            <div className="h-3"></div>
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) =>
                day === null ? (
                  <div key={di} className="w-3 h-3" />
                ) : (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                    title={`${day.date}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                  />
                )
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 justify-end">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-emerald-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function ScoreBar({ label, score }) {
  if (score === null || score === undefined) return null
  const pct = (score / 5) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-xs w-24">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-300 text-xs w-8 text-right">{score}/5</span>
    </div>
  )
}

export default function Dashboard({ data }) {
  const hasStats = data.total_attempts > 0
  const hasScores = data.avg_clarity !== null

  return (
    <div className="mb-10 space-y-6">
      {/* Quote */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <blockquote className="text-gray-300 text-lg italic leading-relaxed">
          "{QUOTE.text}"
        </blockquote>
        <p className="text-gray-500 text-sm mt-2">— {QUOTE.author}</p>
      </div>

      {!hasStats ? (
        <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-lg mb-2">No practice sessions yet</p>
          <p className="text-gray-500 text-sm">
            Pick a question below to start your first practice round.
          </p>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Sessions"
              value={data.total_attempts}
            />
            <StatCard
              label="Questions"
              value={`${data.questions_practiced}/${data.total_questions}`}
              sub="practiced"
            />
            <StatCard
              label="Practice Time"
              value={formatTime(data.total_practice_time)}
            />
            <StatCard
              label="Avg Score"
              value={
                hasScores
                  ? (((data.avg_clarity + data.avg_confidence + data.avg_structure) / 3).toFixed(1))
                  : '—'
              }
              sub={hasScores ? 'out of 5' : 'pending'}
            />
          </div>

          {/* Average scores breakdown */}
          {hasScores && (
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Average Scores</p>
              <ScoreBar label="Clarity" score={data.avg_clarity} />
              <ScoreBar label="Confidence" score={data.avg_confidence} />
              <ScoreBar label="Structure" score={data.avg_structure} />
            </div>
          )}

          {/* Streak calendar */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Practice Activity</p>
            <StreakCalendar activity={data.activity} />
          </div>
        </>
      )}
    </div>
  )
}
