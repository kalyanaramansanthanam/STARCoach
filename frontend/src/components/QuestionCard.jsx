import { useNavigate } from 'react-router-dom'

const CATEGORY_COLORS = {
  Conflict: 'bg-red-600',
  Learning: 'bg-blue-600',
  Failure: 'bg-orange-600',
  Leadership: 'bg-purple-600',
  Technical: 'bg-emerald-600',
  'Trade-offs': 'bg-yellow-600',
  Growth: 'bg-teal-600',
  Impact: 'bg-indigo-600',
}

export default function QuestionCard({ question }) {
  const navigate = useNavigate()
  const tagColor = CATEGORY_COLORS[question.category] || 'bg-gray-600'

  return (
    <div
      className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-500"
      onClick={() => navigate(`/interview/${question.id}`)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`${tagColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
          {question.category}
        </span>
        {question.attempt_count > 0 && (
          <span className="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded-full">
            {question.attempt_count} attempt{question.attempt_count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <p className="text-gray-100 text-sm leading-relaxed">{question.question_text}</p>
      <div className="mt-4 flex justify-between items-center">
        <button
          className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/interview/${question.id}`)
          }}
        >
          Practice
        </button>
        {question.attempt_count > 0 && (
          <button
            className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/review/${question.id}`)
            }}
          >
            Review
          </button>
        )}
      </div>
    </div>
  )
}
