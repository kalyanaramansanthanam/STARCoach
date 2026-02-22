export default function AttemptList({ attempts, selectedId, onSelect }) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Attempts</h3>
        <p className="text-gray-400 text-sm">No attempts yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-3">Attempts</h3>
      <div className="space-y-2">
        {attempts.map((item) => {
          const a = item.attempt
          const isSelected = a.id === selectedId
          const hasAnalysis = !!item.feedback

          return (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isSelected ? 'bg-blue-600/30 border border-blue-500' : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Attempt #{a.attempt_number}</span>
                <span className="text-xs text-gray-400">
                  {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">
                  {a.duration_seconds ? `${Math.round(a.duration_seconds)}s` : ''}
                </span>
                {hasAnalysis ? (
                  <span className="text-xs text-green-400">Analyzed</span>
                ) : (
                  <span className="text-xs text-yellow-400">Pending</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
